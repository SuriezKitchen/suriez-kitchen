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

    if (req.method === "POST") {
      // Create new local video
      const { title, description, thumbnailUrl, videoUrl, duration, views, likes } = req.body;

      if (!title || !description || !thumbnailUrl || !videoUrl || !duration) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const newVideo = await sql`
        INSERT INTO local_videos (id, title, description, thumbnail_url, video_url, duration, views, likes, created_at)
        VALUES (gen_random_uuid(), ${title}, ${description}, ${thumbnailUrl}, ${videoUrl}, ${duration}, ${views || "0"}, ${likes || "0"}, NOW())
        RETURNING id, title, description, thumbnail_url as "thumbnailUrl", video_url as "videoUrl", duration, views, likes, created_at as "createdAt"
      `;

      res.status(201).json(newVideo[0]);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Local Videos API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
