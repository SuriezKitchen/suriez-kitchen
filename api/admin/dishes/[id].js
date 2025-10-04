import { neon } from "@neondatabase/serverless";

// Create Neon client
const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

// Helper function to check admin authentication
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

    const { id } = req.query;

    if (req.method === "PUT") {
      // Update dish
      const { title, description, imageUrl, category } = req.body;

      if (!title || !description || !imageUrl || !category) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const updatedDish = await sql`
        UPDATE dishes 
        SET title = ${title}, description = ${description}, image_url = ${imageUrl}, category = ${category}
        WHERE id = ${id}
        RETURNING id, title, description, image_url as "imageUrl", category, created_at as "createdAt"
      `;

      if (updatedDish.length === 0) {
        return res.status(404).json({ message: "Dish not found" });
      }

      res.status(200).json(updatedDish[0]);
    } else if (req.method === "DELETE") {
      // Delete dish
      const deletedDish = await sql`
        DELETE FROM dishes 
        WHERE id = ${id}
        RETURNING id, title
      `;

      if (deletedDish.length === 0) {
        return res.status(404).json({ message: "Dish not found" });
      }

      res
        .status(200)
        .json({ message: "Dish deleted successfully", dish: deletedDish[0] });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Dishes [id] API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
