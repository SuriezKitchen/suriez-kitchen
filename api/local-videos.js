import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      const videos = await sql`
        SELECT 
          id,
          title,
          description,
          thumbnail_url as "thumbnailUrl",
          video_url as "videoUrl",
          duration,
          views,
          likes,
          created_at as "createdAt"
        FROM local_videos 
        ORDER BY created_at DESC
      `;
      res.status(200).json(videos);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Local Videos API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
