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

  // YouTube API integration endpoint
  app.get("/api/youtube/videos", async (req, res) => {
    const API_KEY = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || process.env.VITE_YOUTUBE_CHANNEL_ID;
    
    if (!API_KEY || !CHANNEL_ID) {
      return res.status(500).json({ 
        message: "YouTube API configuration missing. Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID environment variables." 
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
        message: "Failed to fetch YouTube videos. Please check your API configuration." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
