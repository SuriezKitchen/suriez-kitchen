#!/usr/bin/env node

/**
 * Sync menu items from production Neon database to local SQLite database
 * 
 * Usage: node scripts/sync-menu-items-from-production.js
 * 
 * This script will:
 * 1. Connect to production Neon database (using DATABASE_URL from .env)
 * 2. Fetch all menu items
 * 3. Import them into local SQLite database
 */

import { neon } from "@neondatabase/serverless";
import Database from "better-sqlite3";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config();

const productionDbUrl = process.env.DATABASE_URL;
const localDbPath = path.resolve(process.cwd(), "local.db");

if (!productionDbUrl) {
  console.error("❌ Error: DATABASE_URL not found in .env file");
  console.error("   This script requires DATABASE_URL to connect to production database");
  process.exit(1);
}

console.log("🔄 Syncing menu items from production to local database...");
console.log(`   Production DB: ${productionDbUrl.split('@')[1] || 'Neon PostgreSQL'}`);
console.log(`   Local DB: ${localDbPath}\n`);

try {
  // Connect to production database
  console.log("📡 Connecting to production database...");
  const sql = neon(productionDbUrl);

  // Fetch menu items from production
  console.log("📥 Fetching menu items from production...");
  const menuItems = await sql`
    SELECT 
      id,
      name,
      description,
      price,
      image_url,
      category,
      day_of_week,
      is_available,
      created_at
    FROM menu_items
    ORDER BY created_at DESC
  `;

  console.log(`   ✅ Found ${menuItems.length} menu items in production\n`);

  if (menuItems.length === 0) {
    console.log("ℹ️  No menu items found in production database");
    process.exit(0);
  }

  // Connect to local SQLite database
  console.log("💾 Opening local database...");
  const localDb = new Database(localDbPath);
  localDb.pragma("journal_mode = WAL");

  // Ensure menu_items table exists
  localDb
    .prepare(
      `CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        day_of_week TEXT,
        is_available INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL
      )`
    )
    .run();

  // Clear existing menu items (optional - comment out if you want to keep existing)
  console.log("🗑️  Clearing existing menu items from local database...");
  localDb.prepare("DELETE FROM menu_items").run();

  // Insert menu items
  console.log("📤 Importing menu items into local database...");
  const insertStmt = localDb.prepare(
    `INSERT INTO menu_items (id, name, description, price, image_url, category, day_of_week, is_available, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = localDb.transaction((items) => {
    for (const item of items) {
      // Convert created_at from PostgreSQL timestamp to Unix timestamp (milliseconds)
      let createdAt;
      if (item.created_at instanceof Date) {
        createdAt = item.created_at.getTime();
      } else if (typeof item.created_at === 'string') {
        createdAt = new Date(item.created_at).getTime();
      } else {
        createdAt = Date.now();
      }

      insertStmt.run(
        item.id,
        item.name,
        item.description,
        item.price,
        item.image_url,
        item.category,
        item.day_of_week || null,
        item.is_available ? 1 : 0,
        createdAt
      );
    }
  });

  insertMany(menuItems);

  // Verify import
  const countRow = localDb.prepare("SELECT COUNT(*) as count FROM menu_items").get();
  const count = countRow && typeof countRow === 'object' && 'count' in countRow ? countRow.count : 0;
  
  console.log(`\n✅ Sync completed successfully!`);
  console.log(`   Imported ${count} menu items`);
  console.log(`\n💡 Refresh your menu page to see the items!`);

  localDb.close();
} catch (error) {
  console.error("❌ Sync failed:", error);
  console.error("Error details:", error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    console.error("Stack:", error.stack);
  }
  process.exit(1);
}

