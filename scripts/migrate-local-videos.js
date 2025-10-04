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

async function createLocalVideosTable() {
  try {
    console.log("🔄 Creating local_videos table...");

    // Create the local_videos table
    await sql`
      CREATE TABLE IF NOT EXISTS local_videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        video_url TEXT NOT NULL,
        duration TEXT NOT NULL,
        views TEXT DEFAULT '0',
        likes TEXT DEFAULT '0',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    console.log("✅ local_videos table created successfully!");

    // Insert some sample data
    console.log("📝 Inserting sample local videos...");
    
    const sampleVideos = [
      {
        title: "Perfect Jollof Rice Recipe",
        description: "Learn the secret to making the most delicious Nigerian jollof rice with this step-by-step tutorial. From choosing the right rice to achieving that perfect smoky flavor.",
        thumbnailUrl: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3804.webp",
        videoUrl: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/61678-500316021_tiny.mp4",
        duration: "8:45",
        views: "2,450",
        likes: "156",
      },
      {
        title: "Chicken Curry Masterclass",
        description: "Discover the art of making aromatic and flavorful chicken curry that will transport you to the streets of India. Perfect blend of spices and techniques.",
        thumbnailUrl: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3805.webp",
        videoUrl: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/61678-500316021_tiny.mp4",
        duration: "12:30",
        views: "1,890",
        likes: "134",
      },
      {
        title: "Pasta Making from Scratch",
        description: "From flour to fork - learn how to make fresh pasta that will impress your family and friends. Complete guide to traditional Italian pasta techniques.",
        thumbnailUrl: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3802.webp",
        videoUrl: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/61678-500316021_tiny.mp4",
        duration: "15:20",
        views: "3,120",
        likes: "189",
      }
    ];

    for (const video of sampleVideos) {
      await sql`
        INSERT INTO local_videos (title, description, thumbnail_url, video_url, duration, views, likes, created_at)
        VALUES (${video.title}, ${video.description}, ${video.thumbnailUrl}, ${video.videoUrl}, ${video.duration}, ${video.views}, ${video.likes}, NOW())
        ON CONFLICT DO NOTHING
      `;
      console.log(`✅ Added: ${video.title}`);
    }

    console.log("✅ Sample local videos inserted successfully!");

    // Verify the data
    const videoCount = await sql`SELECT COUNT(*) as count FROM local_videos`;
    console.log(`📊 Total local videos in database: ${videoCount[0].count}`);

    // Show the videos
    const videos = await sql`SELECT title, duration, views, likes FROM local_videos ORDER BY created_at DESC`;
    console.log("\n📹 Local Videos:");
    videos.forEach((video) => {
      console.log(`   - ${video.title} (${video.duration}) - ${video.views} views, ${video.likes} likes`);
    });

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

createLocalVideosTable();
