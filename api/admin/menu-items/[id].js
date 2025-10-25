import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

export default async function handler(req, res) {
  const { id } = req.query;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      const menuItem = await sql`
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
        WHERE id = ${id}
      `;

      if (menuItem.length === 0) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.status(200).json(menuItem[0]);
    } else if (req.method === "PUT") {
      const { name, description, price, imageUrl, category, isAvailable } = req.body;

      if (!name || !description || !price || !imageUrl || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const updatedMenuItem = await sql`
        UPDATE menu_items 
        SET 
          name = ${name},
          description = ${description},
          price = ${price},
          image_url = ${imageUrl},
          category = ${category},
          is_available = ${isAvailable}
        WHERE id = ${id}
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

      if (updatedMenuItem.length === 0) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.status(200).json(updatedMenuItem[0]);
    } else if (req.method === "DELETE") {
      const deletedMenuItem = await sql`
        DELETE FROM menu_items 
        WHERE id = ${id}
        RETURNING id
      `;

      if (deletedMenuItem.length === 0) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.status(200).json({ message: "Menu item deleted successfully" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Menu Item API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
