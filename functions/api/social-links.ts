export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    // Simple SQL query without Drizzle ORM
    const result = await context.env.DB.prepare(
      "SELECT * FROM social_links WHERE is_active = 1"
    ).all();
    
    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching social links:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch social links" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};