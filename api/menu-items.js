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
      const menuItems = await sql`
        SELECT 
          id,
          name,
          description,
          price,
          image_url as "imageUrl",
          category,
          is_available as "isAvailable",
          created_at as "createdAt"
        FROM menu_items 
        WHERE is_available = true
        ORDER BY category, name
      `;
      res.status(200).json(menuItems);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Menu Items API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
