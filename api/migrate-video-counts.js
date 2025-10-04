import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin || req.headers.host;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Update local_videos table to use integer types for views and likes
    await sql`ALTER TABLE local_videos ALTER COLUMN views TYPE integer USING views::integer;`;
    await sql`ALTER TABLE local_videos ALTER COLUMN likes TYPE integer USING likes::integer;`;
    
    res.status(200).json({ 
      message: "Video counts migration applied successfully",
      migration: "Updated views and likes columns to integer type"
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ 
      message: "Migration failed", 
      error: error.message 
    });
  }
}
