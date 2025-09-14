import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema } from "@shared/schema";

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
    const API_KEY =
      process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
    const CHANNEL_ID =
      process.env.YOUTUBE_CHANNEL_ID || process.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!API_KEY || !CHANNEL_ID) {
      return res.status(500).json({
        message:
          "YouTube API configuration missing. Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID environment variables.",
      });
    }

    try {
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
    const API_KEY =
      process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
    const CHANNEL_ID =
      process.env.YOUTUBE_CHANNEL_ID || process.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!API_KEY || !CHANNEL_ID) {
      return res.status(500).json({
        message:
          "YouTube API configuration missing. Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID environment variables.",
      });
    }

    try {
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

  // Admin authentication middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Simple token check - in production, use proper JWT validation
    if (token === "admin-token-123") {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;

    // Simple hardcoded credentials - in production, use proper authentication
    if (username === "admin" && password === "admin123") {
      res.json({ token: "admin-token-123" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Admin routes - protected
  app.post("/api/admin/dishes", authenticateAdmin, async (req, res) => {
    try {
      const dish = await storage.createDish(req.body);
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dish" });
    }
  });

  app.put("/api/admin/dishes/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const dish = await storage.updateDish(id, req.body);
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dish" });
    }
  });

  app.delete("/api/admin/dishes/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDish(id);
      res.json({ message: "Dish deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dish" });
    }
  });

  // Admin category routes - protected
  app.post("/api/admin/categories", authenticateAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateCategory(id, req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete(
    "/api/admin/categories/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        await storage.deleteCategory(id);
        res.json({ message: "Category deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete category" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
