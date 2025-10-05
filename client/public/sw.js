// Service Worker for Suriez Kitchen
// Provides advanced caching for better performance

const CACHE_NAME = "suriez-kitchen-v1";
const STATIC_CACHE = "suriez-static-v1";
const IMAGE_CACHE = "suriez-images-v1";
const VIDEO_CACHE = "suriez-videos-v1";

// Assets to cache immediately (excluding HTML to avoid routing issues)
const STATIC_ASSETS = [
  "/src/assets/fontawesome-custom.css",
  "/src/assets/suriez-logo.png",
];

// Cache strategies
const CACHE_STRATEGIES = {
  // HTML files - network first to avoid routing issues
  html: {
    pattern: /\.html$/,
    strategy: "network-first",
    cacheName: STATIC_CACHE,
    maxAge: 86400, // 1 day
  },

  // Static assets - cache first
  static: {
    pattern: /\.(css|js)$/,
    strategy: "cache-first",
    cacheName: STATIC_CACHE,
    maxAge: 86400 * 30, // 30 days
  },

  // Images - cache first with long expiry
  images: {
    pattern: /\.(png|jpg|jpeg|webp|gif|svg)$/,
    strategy: "cache-first",
    cacheName: IMAGE_CACHE,
    maxAge: 86400 * 365, // 1 year
  },

  // Videos - cache first with medium expiry
  videos: {
    pattern: /\.(mp4|webm|mov)$/,
    strategy: "cache-first",
    cacheName: VIDEO_CACHE,
    maxAge: 86400 * 30, // 30 days
  },

  // API calls - network first
  api: {
    pattern: /\/api\//,
    strategy: "network-first",
    cacheName: "suriez-api-v1",
    maxAge: 86400, // 1 day
  },
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Static assets cached successfully");
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== IMAGE_CACHE &&
              cacheName !== VIDEO_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Skip the main HTML file to avoid routing conflicts
  if (url.pathname === "/" || url.pathname === "/index.html") {
    console.log("Skipping HTML file caching:", url.pathname);
    return;
  }

  // Find matching cache strategy
  const strategy = findCacheStrategy(url.pathname);

  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

// Find appropriate cache strategy for URL
function findCacheStrategy(pathname) {
  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(pathname)) {
      return { name, ...config };
    }
  }
  return null;
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
  const cache = await caches.open(strategy.cacheName);

  switch (strategy.strategy) {
    case "cache-first":
      return cacheFirst(request, cache, strategy.maxAge);

    case "network-first":
      return networkFirst(request, cache, strategy.maxAge);

    default:
      return fetch(request);
  }
}

// Cache-first strategy
async function cacheFirst(request, cache, maxAge) {
  try {
    // Check cache first
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Check if cache is still valid
      const cacheTime = cachedResponse.headers.get("sw-cache-time");
      if (cacheTime && Date.now() - parseInt(cacheTime) < maxAge * 1000) {
        console.log("Serving from cache:", request.url);
        return cachedResponse;
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone response and add cache timestamp
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set("sw-cache-time", Date.now().toString());

      // Cache the response
      await cache.put(request, responseToCache);
      console.log("Cached response:", request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache-first failed:", error);

    // Fallback to cache even if expired
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log("Serving expired cache:", request.url);
      return cachedResponse;
    }

    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cache, maxAge) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set("sw-cache-time", Date.now().toString());
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", request.url);

    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Message handling for cache management
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
