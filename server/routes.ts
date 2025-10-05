import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, settings } from "@shared/schema";
import {
  requireAuth,
  login,
  logout,
  getCurrentUser,
  hashPassword,
  checkRateLimit,
  validatePasswordStrength,
} from "./auth";

// Temporarily disable caching to fix blank page
// const cache = new Map<string, { data: any; timestamp: number }>();
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// function getCachedData(key: string) {
//   const cached = cache.get(key);
//   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//     return cached.data;
//   }
//   cache.delete(key);
//   return null;
// }

// function setCachedData(key: string, data: any) {
//   cache.set(key, { data, timestamp: Date.now() });
// }

// function clearCache() {
//   cache.clear();
// }

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all dishes
  app.get("/api/dishes", async (req, res) => {
    try {
      const dishes = await storage.getDishes();
      res.json(dishes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dishes" });
    }
  });

  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get social links
  app.get("/api/social-links", async (req, res) => {
    try {
      const links = await storage.getSocialLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // YouTube API integration endpoint
  app.get("/api/youtube/videos", async (req, res) => {
    try {
      // Get settings from database
      const settings = await storage.getSettings();
      const apiKeySetting = settings.find((s) => s.key === "youtube_api_key");
      const channelIdSetting = settings.find(
        (s) => s.key === "youtube_channel_id"
      );

      // Fallback to environment variables if not in database
      const API_KEY =
        apiKeySetting?.value ||
        process.env.YOUTUBE_API_KEY ||
        process.env.VITE_YOUTUBE_API_KEY;
      const CHANNEL_ID =
        channelIdSetting?.value ||
        process.env.YOUTUBE_CHANNEL_ID ||
        process.env.VITE_YOUTUBE_CHANNEL_ID;

      if (!API_KEY || !CHANNEL_ID) {
        return res.status(500).json({
          message:
            "YouTube API configuration missing. Please configure your API key and channel ID in the admin settings.",
        });
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=6&type=video`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform YouTube API response to our video format
      const videos = data.items.map((item: any) => ({
        youtubeId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        publishedAt: new Date(item.snippet.publishedAt),
        viewCount: 0, // Would need additional API call for statistics
        likeCount: 0,
      }));

      res.json(videos);
    } catch (error) {
      console.error("YouTube API error:", error);
      res.status(500).json({
        message:
          "Failed to fetch YouTube videos. Please check your API configuration.",
      });
    }
  });

  // YouTube channel statistics endpoint
  app.get("/api/youtube/channel", async (req, res) => {
    try {
      // Get settings from database
      const settings = await storage.getSettings();
      const apiKeySetting = settings.find((s) => s.key === "youtube_api_key");
      const channelIdSetting = settings.find(
        (s) => s.key === "youtube_channel_id"
      );

      // Fallback to environment variables if not in database
      const API_KEY =
        apiKeySetting?.value ||
        process.env.YOUTUBE_API_KEY ||
        process.env.VITE_YOUTUBE_API_KEY;
      const CHANNEL_ID =
        channelIdSetting?.value ||
        process.env.YOUTUBE_CHANNEL_ID ||
        process.env.VITE_YOUTUBE_CHANNEL_ID;

      if (!API_KEY || !CHANNEL_ID) {
        return res.status(500).json({
          message:
            "YouTube API configuration missing. Please configure your API key and channel ID in the admin settings.",
        });
      }

      // First, get channel statistics
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${CHANNEL_ID}&part=statistics`
      );

      if (!statsResponse.ok) {
        throw new Error(`YouTube API error: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();

      if (!statsData.items || statsData.items.length === 0) {
        throw new Error("Channel not found");
      }

      const channelStats = statsData.items[0].statistics;

      // Format subscriber count
      const subscriberCount = parseInt(channelStats.subscriberCount);
      let formattedSubscribers;

      if (subscriberCount >= 1000000) {
        formattedSubscribers = `${(subscriberCount / 1000000).toFixed(1)}M`;
      } else if (subscriberCount >= 1000) {
        formattedSubscribers = `${(subscriberCount / 1000).toFixed(0)}K`;
      } else {
        formattedSubscribers = subscriberCount.toString();
      }

      res.json({
        subscriberCount: subscriberCount,
        formattedSubscribers: formattedSubscribers,
        videoCount: parseInt(channelStats.videoCount),
        viewCount: parseInt(channelStats.viewCount),
      });
    } catch (error) {
      console.error("YouTube channel API error:", error);
      res.status(500).json({
        message:
          "Failed to fetch YouTube channel statistics. Please check your API configuration.",
      });
    }
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username and password are required",
          code: "MISSING_CREDENTIALS",
        });
      }

      // Check rate limiting
      const clientIP = req.ip || req.connection.remoteAddress || "unknown";
      if (!checkRateLimit(clientIP)) {
        return res.status(429).json({
          message: "Too many login attempts. Please try again later.",
          code: "RATE_LIMITED",
        });
      }

      // Get user from database
      const user = await storage.getAdminUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Perform login
      await login(req, res, username, password, user);

      // Update last login time
      if (res.statusCode === 200) {
        await storage.updateAdminUserLastLogin(user.id);
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    logout(req, res);
  });

  // Get current user endpoint
  app.get("/api/admin/me", (req, res) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({
        message: "Not authenticated",
        code: "NOT_AUTHENTICATED",
      });
    }
    res.json({ user });
  });

  // Create admin user endpoint (for initial setup)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username and password are required",
          code: "MISSING_CREDENTIALS",
        });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          message: "Password does not meet requirements",
          code: "WEAK_PASSWORD",
          errors: passwordValidation.errors,
        });
      }

      // Check if user already exists
      const existingUser = await storage.getAdminUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          message: "Username already exists",
          code: "USER_EXISTS",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await storage.createAdminUser({
        username,
        passwordHash,
        email,
        isActive: true,
      });

      res.status(201).json({
        message: "Admin user created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });

  // Change password endpoint
  app.post("/api/admin/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const currentUser = getCurrentUser(req);

      if (!currentUser) {
        return res.status(401).json({
          message: "Not authenticated",
          code: "NOT_AUTHENTICATED",
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required",
          code: "MISSING_PASSWORDS",
        });
      }

      // Get user from database
      const user = await storage.getAdminUserByUsername(currentUser.username);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Verify current password
      const bcrypt = await import("bcryptjs");
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          message: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD",
        });
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          message: "New password does not meet requirements",
          code: "WEAK_PASSWORD",
          errors: passwordValidation.errors,
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password in database
      await storage.updateAdminUserPassword(user.id, newPasswordHash);

      res.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  });

  // Admin routes - protected
  app.post("/api/admin/dishes", requireAuth, async (req, res) => {
    try {
      const dish = await storage.createDish(req.body);
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dish" });
    }
  });

  app.put("/api/admin/dishes/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const dish = await storage.updateDish(id, req.body);
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dish" });
    }
  });

  app.delete("/api/admin/dishes/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDish(id);
      res.json({ message: "Dish deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dish" });
    }
  });

  // Admin category routes - protected
  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateCategory(id, req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const allSettings = await storage.getSettings();
      res.json(allSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:key", requireAuth, async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      await storage.updateSetting(key, value, description);
      res.json({ message: "Setting updated successfully" });
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const { key, value, description } = req.body;

      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }

      await storage.createSetting(key, value, description);
      res.json({ message: "Setting created successfully" });
    } catch (error) {
      console.error("Error creating setting:", error);
      res.status(500).json({ message: "Failed to create setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
