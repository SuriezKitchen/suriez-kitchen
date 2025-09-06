import { drizzle } from "drizzle-orm/d1";
import { socialLinks } from "@shared/schema";
import { eq } from "drizzle-orm";

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const db = drizzle(context.env.DB);

  try {
    const links = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.isActive, true));
    return new Response(JSON.stringify(links), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Failed to fetch social links" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
