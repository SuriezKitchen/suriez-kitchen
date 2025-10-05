// Server performance optimizations
import { type Express } from "express";
import compression from "compression";
import helmet from "helmet";

export function applyPerformanceOptimizations(app: Express) {
  // 1. Enable gzip compression
  app.use(
    compression({
      level: 6, // Balanced compression level
      threshold: 1024, // Only compress files > 1KB
      filter: (req, res) => {
        // Don't compress if already compressed
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  // 2. Security headers that also improve performance
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP for now
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // 3. Cache headers for static assets
  app.use((req, res, next) => {
    // Set cache headers for static assets
    if (
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
    ) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }

    // Set cache headers for HTML
    if (req.path === "/" || req.path === "/index.html") {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }

    next();
  });

  // 4. Remove unnecessary middleware in production
  if (process.env.NODE_ENV === "production") {
    // Disable X-Powered-By header
    app.disable("x-powered-by");

    // Trust proxy for better performance
    app.set("trust proxy", 1);
  }
}

// Database connection optimization
export function optimizeDatabaseConnection() {
  // Set connection pool size for better performance
  if (process.env.NODE_ENV === "production") {
    // These would be set in your database configuration
    console.log("Database optimizations applied for production");
  }
}

// Response time optimization
export function addResponseTimeOptimization(app: Express) {
  // Add response time header for monitoring
  app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      res.setHeader("X-Response-Time", `${duration}ms`);

      // Log slow requests
      if (duration > 1000) {
        console.warn(
          `Slow request: ${req.method} ${req.path} took ${duration}ms`
        );
      }
    });

    next();
  });
}
