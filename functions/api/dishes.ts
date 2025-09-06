export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    // Simple SQL query without Drizzle ORM
    const result = await context.env.DB.prepare(
      "SELECT id, title, description, image_url as imageUrl, category, created_at as createdAt FROM dishes ORDER BY created_at DESC"
    ).all();
    
    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch dishes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
