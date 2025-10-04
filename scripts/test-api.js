#!/usr/bin/env node

import fetch from "node-fetch";

async function testAPI() {
  try {
    console.log("🔄 Testing admin login API...");

    const response = await fetch("https://suriez-kitchen.vercel.app/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "Admin123!@#"
      })
    });

    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log(`📡 Response Body:`, data);

    if (response.ok) {
      console.log("✅ API login successful!");
    } else {
      console.log("❌ API login failed!");
    }

  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

testAPI();
