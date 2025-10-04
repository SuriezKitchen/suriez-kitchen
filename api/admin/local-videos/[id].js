import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

async function checkAdminAuth(req) {
  const cookies = req.headers.cookie || "";
  const sessionMatch = cookies.match(/admin_session=([^;]+)/);

  if (!sessionMatch) {
    return null;
  }

  const sessionToken = sessionMatch[1];

  const sessionData = await sql`
    SELECT value FROM settings WHERE key = ${`session_${sessionToken}`}
  `;

  if (sessionData.length === 0) {
    return null;
  }

  const session = JSON.parse(sessionData[0].value);
  return session;
}

export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin || req.headers.host;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Check authentication
    const session = await checkAdminAuth(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: videoId } = req.query; // Get ID from dynamic route

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    if (req.method === "PUT") {
      // Update local video
      const { title, description, thumbnailUrl, videoUrl, duration, views, likes } = req.body;

      if (!title || !description || !thumbnailUrl || !videoUrl || !duration) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const updatedVideo = await sql`
        UPDATE local_videos 
        SET title = ${title}, description = ${description}, thumbnail_url = ${thumbnailUrl}, video_url = ${videoUrl}, duration = ${duration}, views = ${views || "0"}, likes = ${likes || "0"}
        WHERE id = ${videoId}
        RETURNING id, title, description, thumbnail_url as "thumbnailUrl", video_url as "videoUrl", duration, views, likes, created_at as "createdAt"
      `;

      if (updatedVideo.length === 0) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.status(200).json(updatedVideo[0]);
    } else if (req.method === "DELETE") {
      // Delete local video
      const deletedVideo = await sql`
        DELETE FROM local_videos 
        WHERE id = ${videoId}
        RETURNING id, title
      `;

      if (deletedVideo.length === 0) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.status(200).json({ message: "Video deleted successfully", video: deletedVideo[0] });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Local Videos API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
