import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql", // Changed from sqlite to postgresql for Vercel
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
