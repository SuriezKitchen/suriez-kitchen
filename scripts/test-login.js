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

async function testLogin() {
  try {
    console.log("🔄 Testing admin login...");

    const username = "admin";
    const password = "Admin123!@#";

    // Hash the provided password
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    console.log(`📝 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🔐 Password Hash: ${passwordHash}`);

    // Check if user exists and password matches
    const users = await sql`
      SELECT id, username, email, is_active, password_hash
      FROM admin_users 
      WHERE username = ${username}
    `;

    console.log(`👥 Found ${users.length} users with username '${username}'`);

    if (users.length === 0) {
      console.log("❌ No user found with that username");
      return;
    }

    const user = users[0];
    console.log(`👤 User details:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Is Active: ${user.is_active}`);
    console.log(`   - Stored Hash: ${user.password_hash}`);

    // Check if password matches
    if (user.password_hash === passwordHash) {
      console.log("✅ Password matches! Login should work.");
    } else {
      console.log("❌ Password does not match!");
      console.log(`   Expected: ${passwordHash}`);
      console.log(`   Stored:   ${user.password_hash}`);
    }

    // Check if user is active
    if (!user.is_active) {
      console.log("❌ User account is not active!");
    } else {
      console.log("✅ User account is active");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testLogin();
