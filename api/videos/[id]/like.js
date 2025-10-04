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

    // Increment the like count for the video
    const result = await sql`
      UPDATE local_videos 
      SET likes = likes + 1
      WHERE id = ${videoId}
      RETURNING likes
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ 
      message: "Video liked successfully",
      likes: result[0].likes
    });
  } catch (error) {
    console.error("Like API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
