#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { config } from "dotenv";
import fetch from "node-fetch";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
const blobStoreToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!blobStoreToken) {
  console.error("❌ BLOB_READ_WRITE_TOKEN environment variable is required");
  console.error("   Get it from: https://vercel.com/dashboard/stores");
  process.exit(1);
}

const sql = neon(connectionString);

// List of dish images to migrate
const dishImages = [
  {
    filename: "IMG_3806.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3806.webp",
    title: "Fried Rice & Salad",
  },
  {
    filename: "IMG_3805.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3805.webp",
    title: "Chicken Curry",
  },
  {
    filename: "IMG_3804.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3804.webp",
    title: "Jollof Rice",
  },
  {
    filename: "IMG_3803.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3803.webp",
    title: "Fried & Jollof Rice",
  },
  {
    filename: "IMG_3802.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3802.webp",
    title: "Chicken Pasta",
  },
  {
    filename: "IMG_3801.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3801.webp",
    title: "Rice and Sauce",
  },
  {
    filename: "IMG_3800.webp",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3800.webp",
    title: "Stir Fried Spaghetti",
  },
];

async function migrateImages() {
  try {
    console.log("🔄 Starting image migration to Vercel Blob...");

    for (const image of dishImages) {
      try {
        console.log(`📸 Migrating ${image.title} (${image.filename})...`);

        // Download image from Cloudflare R2
        const response = await fetch(image.url);
        if (!response.ok) {
          console.log(`⚠️  Could not download ${image.filename}, skipping...`);
          continue;
        }

        const imageBuffer = await response.buffer();

        // Upload to Vercel Blob
        const blob = await put(`dishes/${image.filename}`, imageBuffer, {
          access: "public",
          token: blobStoreToken,
        });

        console.log(`✅ Uploaded to: ${blob.url}`);

        // Update database with new URL
        await sql`
          UPDATE dishes 
          SET image_url = ${blob.url}
          WHERE title = ${image.title}
        `;

        console.log(`✅ Updated database for ${image.title}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${image.filename}:`, error.message);
      }
    }

    console.log("✅ Image migration completed!");

    // Verify the updated URLs
    const dishes =
      await sql`SELECT title, image_url FROM dishes ORDER BY created_at DESC`;
    console.log("\n📊 Updated dish URLs:");
    dishes.forEach((dish) => {
      console.log(`   ${dish.title}: ${dish.image_url}`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
