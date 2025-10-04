import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

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
    if (req.method === "GET") {
      // Check session (me)
      const session = await checkAdminAuth(req);
      if (!session) {
        return res.status(401).json({ message: "No session found" });
      }
      
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
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin Login API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
