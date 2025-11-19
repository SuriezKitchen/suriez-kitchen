import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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
        ORDER BY category, name
      `;
      res.status(200).json(menuItems);
    } else if (req.method === "POST") {
      const { name, description, price, imageUrl, category, isAvailable } = req.body;

      if (!name || !description || !price || !imageUrl || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newMenuItem = await sql`
        INSERT INTO menu_items (name, description, price, image_url, category, is_available)
        VALUES (${name}, ${description}, ${price}, ${imageUrl}, ${category}, ${isAvailable || true})
        RETURNING 
          id,
          name,
          description,
          price,
          image_url as "imageUrl",
          category,
          is_available as "isAvailable",
          created_at as "createdAt"
      `;

      res.status(201).json(newMenuItem[0]);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Menu Items API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
