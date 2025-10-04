import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Create Neon client
const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

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
    // Determine the operation based on method and body
    let operation = "login"; // default

    if (req.method === "GET") {
      operation = "me";
    } else if (req.method === "POST") {
      const body = req.body;
      if (body && body.operation === "logout") {
        operation = "logout";
      } else {
        operation = "login";
      }
    }

    if (req.method === "POST" && operation === "login") {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      // Hash the provided password
      const passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      // Check if user exists and password matches
      const users = await sql`
        SELECT id, username, email, is_active 
        FROM admin_users 
        WHERE username = ${username} AND password_hash = ${passwordHash} AND is_active = true
      `;

      if (users.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = users[0];

      // Update last login time
      await sql`
        UPDATE admin_users 
        SET last_login_at = NOW() 
        WHERE id = ${user.id}
      `;

      // Set session cookie (simple approach for Vercel)
      const sessionToken = crypto.randomBytes(32).toString("hex");

      // Store session in database (simple approach)
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

      // Set cookie
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
    } else if (req.method === "GET" && operation === "me") {
      // Get session token from cookie
      const cookies = req.headers.cookie || "";
      const sessionMatch = cookies.match(/admin_session=([^;]+)/);

      if (!sessionMatch) {
        return res.status(401).json({ message: "No session found" });
      }

      const sessionToken = sessionMatch[1];

      // Get session data from database
      const sessionData = await sql`
        SELECT value FROM settings WHERE key = ${`session_${sessionToken}`}
      `;

      if (sessionData.length === 0) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const session = JSON.parse(sessionData[0].value);

      // Get user data
      const users = await sql`
        SELECT id, username, email, is_active, last_login_at
        FROM admin_users 
        WHERE id = ${session.userId} AND is_active = true
      `;

      if (users.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = users[0];

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          lastLoginAt: user.last_login_at,
        },
      });
    } else if (req.method === "POST" && operation === "logout") {
      // Get session token from cookie
      const cookies = req.headers.cookie || "";
      const sessionMatch = cookies.match(/admin_session=([^;]+)/);

      if (sessionMatch) {
        const sessionToken = sessionMatch[1];

        // Remove session from database
        await sql`
          DELETE FROM settings WHERE key = ${`session_${sessionToken}`}
        `;
      }

      // Clear cookie
      res.setHeader(
        "Set-Cookie",
        "admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
      );

      res.status(200).json({ message: "Logout successful" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Auth API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
