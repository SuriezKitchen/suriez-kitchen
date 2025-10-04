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

    // Parse URL to get category ID if present
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const categoryId = pathSegments[3]; // admin/categories/[id]
    
    // Also check if the ID is in the query parameters (for dynamic routes)
    const { id: queryId } = req.query;
    const finalCategoryId = categoryId || queryId;

    if (req.method === "POST") {
      // Create new category
      const { name, description, color, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const newCategory = await sql`
        INSERT INTO categories (id, name, description, color, is_active, created_at)
        VALUES (gen_random_uuid(), ${name}, ${description || ""}, ${color || "#3B82F6"}, ${isActive !== false}, NOW())
        RETURNING id, name, description, color, is_active as "isActive", created_at as "createdAt"
      `;

      res.status(201).json(newCategory[0]);
    } else if (req.method === "PUT" && finalCategoryId) {
      // Update category
      const { name, description, color, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const updatedCategory = await sql`
        UPDATE categories 
        SET name = ${name}, description = ${description || ""}, color = ${color || "#3B82F6"}, is_active = ${isActive !== false}
        WHERE id = ${finalCategoryId}
        RETURNING id, name, description, color, is_active as "isActive", created_at as "createdAt"
      `;

      if (updatedCategory.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json(updatedCategory[0]);
    } else if (req.method === "DELETE" && finalCategoryId) {
      // Delete category
      const deletedCategory = await sql`
        DELETE FROM categories 
        WHERE id = ${finalCategoryId}
        RETURNING id, name
      `;

      if (deletedCategory.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category deleted successfully", category: deletedCategory[0] });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Categories API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
