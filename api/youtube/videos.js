import { neon } from "@neondatabase/serverless";

// Create Neon client
const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      // Get videos from database
      const videosData = await sql`
        SELECT 
          id,
          youtube_id as "youtubeId",
          title,
          description,
          thumbnail_url as "thumbnailUrl",
          view_count as "viewCount",
          like_count as "likeCount",
          published_at as "publishedAt",
          created_at as "createdAt"
        FROM videos 
        ORDER BY published_at DESC 
        LIMIT 50
      `;

      res.status(200).json(videosData);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("YouTube Videos API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
