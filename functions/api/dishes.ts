import { drizzle } from "drizzle-orm/d1";
import { dishes } from "@shared/schema";

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const db = drizzle(context.env.DB);

  try {
    const allDishes = await db.select().from(dishes).orderBy(dishes.createdAt);
    return new Response(JSON.stringify(allDishes), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch dishes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
