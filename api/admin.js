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
    // Check authentication for all admin operations
    const session = await checkAdminAuth(req);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Parse the URL to determine the operation
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Determine operation based on path and method
    const operation = pathSegments[2]; // admin/[operation]
    const id = pathSegments[3]; // admin/[operation]/[id]

    if (operation === "login") {
      // Handle login operations
      if (req.method === "GET") {
        // Check session (me)
        res.status(200).json({
          user: {
            id: session.userId,
            username: session.username,
            email: "admin@suriezkitchen.com",
            lastLoginAt: new Date().toISOString(),
          },
        });
      } else if (req.method === "POST") {
        const body = req.body;
        if (body && body.operation === "logout") {
          // Handle logout
          const cookies = req.headers.cookie || "";
          const sessionMatch = cookies.match(/admin_session=([^;]+)/);

          if (sessionMatch) {
            const sessionToken = sessionMatch[1];
            await sql`
              DELETE FROM settings WHERE key = ${`session_${sessionToken}`}
            `;
          }

          res.setHeader(
            "Set-Cookie",
            "admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
          );

          res.status(200).json({ message: "Logout successful" });
        } else {
          // Handle login
          const { username, password } = req.body;

          if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
          }

          const crypto = await import("crypto");
          const passwordHash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

          const users = await sql`
            SELECT id, username, email, is_active 
            FROM admin_users 
            WHERE username = ${username} AND password_hash = ${passwordHash} AND is_active = true
          `;

          if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          const user = users[0];

          await sql`
            UPDATE admin_users 
            SET last_login_at = NOW() 
            WHERE id = ${user.id}
          `;

          const sessionToken = crypto.randomBytes(32).toString("hex");

          await sql`
            INSERT INTO settings (id, key, value, description, updated_at)
            VALUES (
              gen_random_uuid(),
              ${`session_${sessionToken}`},
              ${JSON.stringify({ userId: user.id, username: user.username })},
              'Admin session token',
              NOW()
            )
            ON CONFLICT (key) DO UPDATE SET
              value = EXCLUDED.value,
              updated_at = NOW()
          `;

          res.setHeader(
            "Set-Cookie",
            `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
          );

          res.status(200).json({
            message: "Login successful",
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
          });
        }
      }
    } else if (operation === "dishes") {
      // Handle dishes operations
      if (req.method === "POST") {
        // Create new dish
        const { title, description, imageUrl, category } = req.body;

        if (!title || !description || !imageUrl || !category) {
          return res.status(400).json({ message: "All fields are required" });
        }

        const newDish = await sql`
          INSERT INTO dishes (id, title, description, image_url, category, created_at)
          VALUES (gen_random_uuid(), ${title}, ${description}, ${imageUrl}, ${category}, NOW())
          RETURNING id, title, description, image_url as "imageUrl", category, created_at as "createdAt"
        `;

        res.status(201).json(newDish[0]);
      } else if (req.method === "PUT" && id) {
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
      } else if (req.method === "DELETE" && id) {
        // Delete dish
        const deletedDish = await sql`
          DELETE FROM dishes 
          WHERE id = ${id}
          RETURNING id, title
        `;

        if (deletedDish.length === 0) {
          return res.status(404).json({ message: "Dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", dish: deletedDish[0] });
      } else {
        res.status(405).json({ message: "Method not allowed" });
      }
    } else if (operation === "categories") {
      // Handle categories operations
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
      } else if (req.method === "PUT" && id) {
        // Update category
        const { name, description, color, isActive } = req.body;

        if (!name) {
          return res.status(400).json({ message: "Category name is required" });
        }

        const updatedCategory = await sql`
          UPDATE categories 
          SET name = ${name}, description = ${description || ""}, color = ${color || "#3B82F6"}, is_active = ${isActive !== false}
          WHERE id = ${id}
          RETURNING id, name, description, color, is_active as "isActive", created_at as "createdAt"
        `;

        if (updatedCategory.length === 0) {
          return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updatedCategory[0]);
      } else if (req.method === "DELETE" && id) {
        // Delete category
        const deletedCategory = await sql`
          DELETE FROM categories 
          WHERE id = ${id}
          RETURNING id, name
        `;

        if (deletedCategory.length === 0) {
          return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully", category: deletedCategory[0] });
      } else {
        res.status(405).json({ message: "Method not allowed" });
      }
    } else if (operation === "local-videos") {
      // Handle local videos operations
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
      } else if (req.method === "PUT" && id) {
        // Update local video
        const { title, description, thumbnailUrl, videoUrl, duration, views, likes } = req.body;

        if (!title || !description || !thumbnailUrl || !videoUrl || !duration) {
          return res.status(400).json({ message: "All required fields must be provided" });
        }

        const updatedVideo = await sql`
          UPDATE local_videos 
          SET title = ${title}, description = ${description}, thumbnail_url = ${thumbnailUrl}, video_url = ${videoUrl}, duration = ${duration}, views = ${views || "0"}, likes = ${likes || "0"}
          WHERE id = ${id}
          RETURNING id, title, description, thumbnail_url as "thumbnailUrl", video_url as "videoUrl", duration, views, likes, created_at as "createdAt"
        `;

        if (updatedVideo.length === 0) {
          return res.status(404).json({ message: "Video not found" });
        }

        res.status(200).json(updatedVideo[0]);
      } else if (req.method === "DELETE" && id) {
        // Delete local video
        const deletedVideo = await sql`
          DELETE FROM local_videos 
          WHERE id = ${id}
          RETURNING id, title
        `;

        if (deletedVideo.length === 0) {
          return res.status(404).json({ message: "Video not found" });
        }

        res.status(200).json({ message: "Video deleted successfully", video: deletedVideo[0] });
      } else {
        res.status(405).json({ message: "Method not allowed" });
      }
    } else {
      res.status(404).json({ message: "Operation not found" });
    }
  } catch (error) {
    console.error("Admin API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
