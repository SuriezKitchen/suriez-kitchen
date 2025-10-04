#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import fetch from "node-fetch";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!youtubeApiKey) {
  console.error("❌ YOUTUBE_API_KEY environment variable is required");
  process.exit(1);
}

if (!youtubeChannelId) {
  console.error("❌ YOUTUBE_CHANNEL_ID environment variable is required");
  process.exit(1);
}

const sql = neon(connectionString);

async function fetchYouTubeVideos() {
  try {
    console.log("🔄 Fetching videos from YouTube API...");
    console.log(`📺 Channel ID: ${youtubeChannelId}`);

    // First, get the uploads playlist ID for the channel
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${youtubeChannelId}&key=${youtubeApiKey}`
    );

    if (!channelResponse.ok) {
      throw new Error(
        `Failed to fetch channel data: ${channelResponse.status}`
      );
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error("Channel not found or no uploads playlist");
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;
    console.log(`📋 Uploads Playlist ID: ${uploadsPlaylistId}`);

    // Now fetch videos from the uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${youtubeApiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error(`Failed to fetch videos: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();
    console.log(`📹 Found ${videosData.items.length} videos`);

    // Clear existing videos
    console.log("🗑️ Clearing existing videos...");
    await sql`DELETE FROM videos`;

    // Insert new videos
    console.log("📝 Inserting videos into database...");
    for (const item of videosData.items) {
      const video = item.snippet;
      const videoId = video.resourceId.videoId;

      // Get additional video details (views, likes, etc.)
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${youtubeApiKey}`
      );

      let viewCount = 0;
      let likeCount = 0;

      if (videoDetailsResponse.ok) {
        const videoDetails = await videoDetailsResponse.json();
        if (videoDetails.items && videoDetails.items.length > 0) {
          const stats = videoDetails.items[0].statistics;
          viewCount = parseInt(stats.viewCount) || 0;
          likeCount = parseInt(stats.likeCount) || 0;
        }
      }

      await sql`
        INSERT INTO videos (
          id, 
          youtube_id, 
          title, 
          description, 
          thumbnail_url, 
          view_count, 
          like_count, 
          published_at, 
          created_at
        ) VALUES (
          gen_random_uuid(),
          ${videoId},
          ${video.title},
          ${video.description || ""},
          ${
            video.thumbnails.maxres?.url ||
            video.thumbnails.high?.url ||
            video.thumbnails.default?.url
          },
          ${viewCount},
          ${likeCount},
          ${new Date(video.publishedAt)},
          NOW()
        )
      `;

      console.log(`✅ Added: ${video.title}`);
    }

    console.log("✅ YouTube videos fetched and stored successfully!");

    // Verify the data
    const videoCount = await sql`SELECT COUNT(*) as count FROM videos`;
    console.log(`📊 Total videos in database: ${videoCount[0].count}`);
  } catch (error) {
    console.error("❌ Failed to fetch YouTube videos:", error.message);
    process.exit(1);
  }
}

fetchYouTubeVideos();
