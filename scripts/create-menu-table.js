import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const sql = neon(connectionString);

async function createMenuTable() {
  try {
    console.log("Creating menu_items table...");
    
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text NOT NULL,
        price text NOT NULL,
        image_url text NOT NULL,
        category text NOT NULL,
        is_available boolean DEFAULT true,
        created_at timestamp DEFAULT NOW()
      );
    `;
    
    console.log("✅ menu_items table created successfully!");
  } catch (error) {
    console.error("❌ Error creating menu_items table:", error);
  }
}

createMenuTable();
