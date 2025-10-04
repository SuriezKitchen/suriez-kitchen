#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import fetch from "node-fetch";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;

if (!connectionString || !youtubeApiKey || !youtubeChannelId) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const sql = neon(connectionString);

async function fetchChannelStats() {
  try {
    console.log("🔄 Fetching channel statistics...");

    // Fetch channel statistics
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeChannelId}&key=${youtubeApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch channel stats: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }

    const stats = data.items[0].statistics;
    const subscriberCount = parseInt(stats.subscriberCount) || 0;
    const videoCount = parseInt(stats.videoCount) || 0;
    const viewCount = parseInt(stats.viewCount) || 0;

    console.log("📊 Channel Statistics:");
    console.log(`   - Subscribers: ${subscriberCount.toLocaleString()}`);
    console.log(`   - Videos: ${videoCount.toLocaleString()}`);
    console.log(`   - Total Views: ${viewCount.toLocaleString()}`);

    // Store in settings table for the API to use
    await sql`
      INSERT INTO settings (id, key, value, description, updated_at)
      VALUES (
        gen_random_uuid(),
        'youtube_subscriber_count',
        ${subscriberCount.toString()},
        'YouTube channel subscriber count',
        NOW()
      )
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;

    await sql`
      INSERT INTO settings (id, key, value, description, updated_at)
      VALUES (
        gen_random_uuid(),
        'youtube_video_count',
        ${videoCount.toString()},
        'YouTube channel video count',
        NOW()
      )
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;

    await sql`
      INSERT INTO settings (id, key, value, description, updated_at)
      VALUES (
        gen_random_uuid(),
        'youtube_view_count',
        ${viewCount.toString()},
        'YouTube channel total view count',
        NOW()
      )
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;

    console.log("✅ Channel statistics stored successfully!");
  } catch (error) {
    console.error("❌ Failed to fetch channel stats:", error.message);
    process.exit(1);
  }
}

fetchChannelStats();
