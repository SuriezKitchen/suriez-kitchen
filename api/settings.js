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
    // Parse the URL to determine the operation
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Determine operation based on path
    const operation = pathSegments[1]; // settings/[operation]

    if (operation === "youtube-api-key") {
      // Handle YouTube API key operations
      const session = await checkAdminAuth(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.method === "PUT") {
        const { value, description } = req.body;

        if (!value) {
          return res.status(400).json({ message: "Value is required" });
        }

        await sql`
          INSERT INTO settings (id, key, value, description, updated_at)
          VALUES (
            gen_random_uuid(),
            'youtube_api_key',
            ${value},
            ${
              description ||
              "YouTube Data API v3 Key for fetching channel data and videos"
            },
            NOW()
          )
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            description = EXCLUDED.description,
            updated_at = NOW();
        `;

        res.status(200).json({ message: "YouTube API key updated successfully" });
      } else {
        res.status(405).json({ message: "Method not allowed" });
      }
    } else if (operation === "youtube-channel-id") {
      // Handle YouTube Channel ID operations
      const session = await checkAdminAuth(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.method === "PUT") {
        const { value, description } = req.body;

        if (!value) {
          return res.status(400).json({ message: "Value is required" });
        }

        await sql`
          INSERT INTO settings (id, key, value, description, updated_at)
          VALUES (
            gen_random_uuid(),
            'youtube_channel_id',
            ${value},
            ${
              description ||
              "YouTube Channel ID for fetching channel data and videos"
            },
            NOW()
          )
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            description = EXCLUDED.description,
            updated_at = NOW();
        `;

        res
          .status(200)
          .json({ message: "YouTube Channel ID updated successfully" });
      } else {
        res.status(405).json({ message: "Method not allowed" });
      }
    } else {
      // Handle general settings operations (GET all settings)
      const session = await checkAdminAuth(req);
      if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.method === "GET") {
        // Get all settings
        const settings = await sql`
          SELECT key, value, description, updated_at as "updatedAt"
          FROM settings 
          WHERE key NOT LIKE 'session_%'
          ORDER BY key
        `;
        
        res.status(200).json(settings);
      } else {
        res.status(405).json({ message: "Method not allowed" });
      }
    }
  } catch (error) {
    console.error("Settings API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}