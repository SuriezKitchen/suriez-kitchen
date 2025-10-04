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
      // Get real channel stats from settings table
      const settings = await sql`
        SELECT key, value FROM settings 
        WHERE key IN ('youtube_subscriber_count', 'youtube_video_count', 'youtube_view_count')
      `;

      const stats = {};
      settings.forEach((setting) => {
        stats[setting.key] = parseInt(setting.value) || 0;
      });

      const subscriberCount = stats.youtube_subscriber_count || 0;
      const videoCount = stats.youtube_video_count || 0;
      const viewCount = stats.youtube_view_count || 0;

      const channelStats = {
        subscriberCount,
        videoCount,
        viewCount,
        formattedSubscribers: `${subscriberCount.toLocaleString()} subscribers`,
        videoCount,
        viewCount,
      };

      res.status(200).json(channelStats);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("YouTube Channel API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
