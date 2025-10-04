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
    const { id: videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    // Increment the view count for the video
    const result = await sql`
      UPDATE local_videos 
      SET views = views + 1
      WHERE id = ${videoId}
      RETURNING views
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ 
      message: "View tracked successfully",
      views: result[0].views
    });
  } catch (error) {
    console.error("View API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
