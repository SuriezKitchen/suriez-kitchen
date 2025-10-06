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

// Sample data to migrate
const sampleDishes = [
  {
    title: "Fried Rice & Salad",
    description:
      "Colorful fried rice served with a crisp, refreshing salad for a balanced and tasty meal.",
    image_url:
      "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3806.webp",
    category: "Dinner",
    created_at: new Date("2025-09-13T19:48:43.316Z"),
  },
  {
    title: "Chicken Curry",
    description:
      "Fragrant chicken curry paired with fluffy rice and warm, soft naan bread for a hearty, flavorful meal.",
    image_url:
      "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3805.webp",
    category: "Dinner",
    created_at: new Date("2025-09-13T19:46:19.945Z"),
  },
  {
    title: "Jollof Rice",
    description:
      "Smoky Nigerian jollof rice served with juicy chicken and sweet, golden fried plantain.",
    image_url:
      "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3804.webp",
    category: "Rice",
    created_at: new Date("2025-09-13T19:44:49.586Z"),
  },
  {
    title: "Fried & Jollof Rice",
    description:
      "A flavorful combo of smoky Nigerian jollof rice and savory fried rice, served with juicy chicken and sweet fried plantain.",
    image_url:
      "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3803.webp",
    category: "Rice",
    created_at: new Date("2025-09-13T19:43:00.185Z"),
  },
  {
    title: "Chicken Pasta",
    description:
      "Creamy chicken pasta tossed with tender pieces of chicken and flavorful herbs for a comforting meal.",
    image_url:
      "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/dishes/IMG_3802.webp",
    category: "Pasta",
    created_at: new Date("2025-09-13T19:40:00.001Z"),
  },
  {
    title: "Rice and Sauce",
    description:
      "Tender beef in savory sauce, served with golden turmeric rice and a fresh avocado salad.",
    image_url:
      "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3801.webp",
    category: "Rice",
    created_at: new Date("2025-09-13T19:38:38.358Z"),
  },
  {
    title: "Stir Fried Spaghetti",
    description:
      "Spaghetti stir-fried to perfection with rich seasonings and a delicious mix of flavors.",
    image_url:
      "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/IMG_3800.webp",
    category: "Pasta",
    created_at: new Date("2025-09-13T19:33:55.233Z"),
  },
];

const sampleCategories = [
  {
    name: "Breakfast",
    description: "Morning meals and brunch items",
    color: "#F59E0B",
    is_active: true,
  },
  {
    name: "Rice",
    description: "Rice-based dishes and grains",
    color: "#10B981",
    is_active: true,
  },
  {
    name: "Poultry",
    description: "Chicken, turkey, and other bird dishes",
    color: "#EF4444",
    is_active: true,
  },
  {
    name: "Salad",
    description: "Fresh salads and vegetable dishes",
    color: "#22C55E",
    is_active: true,
  },
  {
    name: "Seafood",
    description: "Fish and seafood dishes",
    color: "#3B82F6",
    is_active: true,
  },
  {
    name: "Meat",
    description: "Beef, pork, and other meat dishes",
    color: "#8B5CF6",
    is_active: true,
  },
  {
    name: "Dessert",
    description: "Sweet treats and desserts",
    color: "#EC4899",
    is_active: true,
  },
  {
    name: "Pasta",
    description: "Pasta and noodle dishes",
    color: "#F97316",
    is_active: true,
  },
  {
    name: "Vegetarian",
    description: "Plant-based dishes",
    color: "#84CC16",
    is_active: true,
  },
  {
    name: "Mediterranean",
    description: "Mediterranean cuisine",
    color: "#06B6D4",
    is_active: true,
  },
  {
    name: "Dinner",
    description: "Evening meals and dinner dishes",
    color: "#6366F1",
    is_active: true,
  },
];

const sampleSocialLinks = [
  {
    platform: "youtube",
    url: "https://youtube.com/@Sureiyahsaid",
    username: "@Sureiyahsaid",
    is_active: true,
  },
  {
    platform: "instagram",
    url: "https://instagram.com/suriez_kitchen",
    username: "@suriez_kitchen",
    is_active: true,
  },
];

async function migrateData() {
  try {
    console.log("🔄 Starting data migration to Neon database...");

    // Insert categories
    console.log("📂 Inserting categories...");
    for (const category of sampleCategories) {
      await sql`
        INSERT INTO categories (id, name, description, color, is_active, created_at)
        VALUES (gen_random_uuid(), ${category.name}, ${category.description}, ${category.color}, ${category.is_active}, NOW())
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // Insert dishes
    console.log("🍽️ Inserting dishes...");
    for (const dish of sampleDishes) {
      await sql`
        INSERT INTO dishes (id, title, description, image_url, category, created_at)
        VALUES (gen_random_uuid(), ${dish.title}, ${dish.description}, ${dish.image_url}, ${dish.category}, ${dish.created_at})
      `;
    }

    // Insert social links
    console.log("🔗 Inserting social links...");
    for (const link of sampleSocialLinks) {
      await sql`
        INSERT INTO social_links (id, platform, url, username, is_active)
        VALUES (gen_random_uuid(), ${link.platform}, ${link.url}, ${link.username}, ${link.is_active})
      `;
    }

    console.log("✅ Data migration completed successfully!");

    // Verify the data
    const dishCount = await sql`SELECT COUNT(*) as count FROM dishes`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    const linkCount = await sql`SELECT COUNT(*) as count FROM social_links`;

    console.log(`📊 Migration Summary:`);
    console.log(`   - Dishes: ${dishCount[0].count}`);
    console.log(`   - Categories: ${categoryCount[0].count}`);
    console.log(`   - Social Links: ${linkCount[0].count}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateData();
