#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import crypto from "crypto";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(connectionString);

async function createAdminUser() {
  try {
    console.log("🔄 Creating admin user...");

    const username = "admin";
    const password = "Admin123!@#";

    // Hash the password (simple hash for demo - in production use bcrypt)
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Check if admin user already exists
    const existingUser = await sql`
      SELECT id FROM admin_users WHERE username = ${username}
    `;

    if (existingUser.length > 0) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    await sql`
      INSERT INTO admin_users (id, username, password_hash, email, is_active, created_at)
      VALUES (
        gen_random_uuid(),
        ${username},
        ${passwordHash},
        'admin@suriezkitchen.com',
        true,
        NOW()
      )
    `;

    console.log("✅ Admin user created successfully!");
    console.log(`📝 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
    console.log("📧 Email: admin@suriezkitchen.com");
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
