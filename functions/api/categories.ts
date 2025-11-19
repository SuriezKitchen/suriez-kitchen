export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    // Get unique categories from dishes
    const result = await context.env.DB.prepare(
      "SELECT DISTINCT category FROM dishes ORDER BY category ASC"
    ).all();

    // Transform the result to match the expected Category schema
    const categories = result.results.map((row: any) => ({
      name: row.category,
    }));

    return new Response(JSON.stringify(categories), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch categories" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

