import type { VercelRequest, VercelResponse } from "@vercel/node";
import { registerRoutes } from "../server/routes";
import { PostgresStorage } from "../server/storage-postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Create a mock Express-like request/response
  const mockReq = {
    ...req,
    body: req.body,
    query: req.query,
    params: req.params,
    method: req.method,
    url: req.url,
    headers: req.headers,
  };

  const mockRes = {
    ...res,
    json: (data: any) => res.json(data),
    status: (code: number) => ({
      json: (data: any) => res.status(code).json(data),
    }),
    send: (data: any) => res.send(data),
    setHeader: (name: string, value: string) => res.setHeader(name, value),
  };

  try {
    // Initialize PostgreSQL storage
    const storage = new PostgresStorage();
    
    // Add storage to request object
    (mockReq as any).storage = storage;
    
    // Import and use your existing routes
    await registerRoutes(mockReq as any, mockRes as any);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
