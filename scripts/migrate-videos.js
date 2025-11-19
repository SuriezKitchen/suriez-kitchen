#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(connectionString);

// Sample video data - you can replace these with your actual YouTube video IDs
const sampleVideos = [
  {
    youtubeId: "dQw4w9WgXcQ", // Replace with your actual video ID
    title: "Welcome to Suriez Kitchen",
    description:
      "Join me on my culinary journey as I share delicious recipes and cooking tips from my kitchen.",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    viewCount: 1250,
    likeCount: 89,
    publishedAt: new Date("2024-01-15T10:00:00Z"),
  },
  {
    youtubeId: "jNQXAC9IVRw", // Replace with your actual video ID
    title: "How to Make Perfect Jollof Rice",
    description:
      "Learn the secret to making the most delicious Nigerian jollof rice with this step-by-step tutorial.",
    thumbnailUrl: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    viewCount: 2100,
    likeCount: 156,
    publishedAt: new Date("2024-01-20T14:30:00Z"),
  },
  {
    youtubeId: "M7lc1UVf-VE", // Replace with your actual video ID
    title: "Chicken Curry Recipe",
    description:
      "Aromatic and flavorful chicken curry that will transport you to the streets of India.",
    thumbnailUrl: "https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg",
    viewCount: 1800,
    likeCount: 134,
    publishedAt: new Date("2024-01-25T16:45:00Z"),
  },
  {
    youtubeId: "9bZkp7q19f0", // Replace with your actual video ID
    title: "Pasta Making from Scratch",
    description:
      "From flour to fork - learn how to make fresh pasta that will impress your family and friends.",
    thumbnailUrl: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    viewCount: 950,
    likeCount: 67,
    publishedAt: new Date("2024-02-01T12:15:00Z"),
  },
];

async function migrateVideos() {
  try {
    console.log("🔄 Starting video data migration...");

    // Insert sample videos
    console.log("📹 Inserting sample videos...");
    for (const video of sampleVideos) {
      await sql`
        INSERT INTO videos (id, youtube_id, title, description, thumbnail_url, view_count, like_count, published_at, created_at)
        VALUES (gen_random_uuid(), ${video.youtubeId}, ${video.title}, ${video.description}, ${video.thumbnailUrl}, ${video.viewCount}, ${video.likeCount}, ${video.publishedAt}, NOW())
        ON CONFLICT (youtube_id) DO NOTHING
      `;
    }

    console.log("✅ Video migration completed successfully!");

    // Verify the data
    const videoCount = await sql`SELECT COUNT(*) as count FROM videos`;
    console.log(`📊 Migration Summary:`);
    console.log(`   - Videos: ${videoCount[0].count}`);

    // Show the videos
    const videos =
      await sql`SELECT title, youtube_id FROM videos ORDER BY published_at DESC`;
    console.log("\n📹 Added Videos:");
    videos.forEach((video) => {
      console.log(`   - ${video.title} (${video.youtube_id})`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateVideos();
