// Script to test cache headers for your assets
// Run with: node scripts/test-cache-headers.js

const https = require("https");

const assets = [
  {
    name: "Vercel Storage Video File",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/videos/sureiz-kitchen-assets_61678-500316021_tiny.mp4",
    expected: "public, max-age=2592000",
  },
  {
    name: "R2 Logo (if exists)",
    url: "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/suriez-logo.png",
    expected: "public, max-age=31536000, immutable",
  },
  {
    name: "Vercel Storage Logo",
    url: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/logos/sureiz-kitchen-assets_suriez-logo.webp",
    expected: "public, max-age=2592000",
  },
];

function checkCacheHeaders(url, name, expected) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD" }, (res) => {
      const cacheControl = res.headers["cache-control"];
      const contentLength = res.headers["content-length"];

      console.log(`\n📁 ${name}`);
      console.log(`   URL: ${url}`);
      console.log(
        `   Size: ${
          contentLength
            ? (parseInt(contentLength) / 1024).toFixed(1) + " KiB"
            : "Unknown"
        }`
      );
      console.log(`   Cache-Control: ${cacheControl || "None"}`);

      if (cacheControl) {
        if (cacheControl.includes(expected.split(",")[0])) {
          console.log(`   ✅ Status: GOOD - Cache headers present`);
        } else {
          console.log(
            `   ⚠️  Status: PARTIAL - Cache headers present but different`
          );
        }
      } else {
        console.log(`   ❌ Status: MISSING - No cache headers`);
      }

      resolve();
    });

    req.on("error", (error) => {
      console.log(`\n📁 ${name}`);
      console.log(`   URL: ${url}`);
      console.log(`   ❌ Status: ERROR - ${error.message}`);
      resolve();
    });

    req.end();
  });
}

async function testAllAssets() {
  console.log("🔍 Testing Cache Headers for Suriez Kitchen Assets");
  console.log("================================================");

  for (const asset of assets) {
    await checkCacheHeaders(asset.url, asset.name, asset.expected);
  }

  console.log("\n📊 Summary:");
  console.log("===========");
  console.log("✅ GOOD: Cache headers properly configured");
  console.log("⚠️  PARTIAL: Cache headers present but could be optimized");
  console.log("❌ MISSING: No cache headers - needs configuration");
  console.log("\n💡 Next steps:");
  console.log("1. Configure R2 cache headers (see implement-r2-cache.md)");
  console.log("2. Run this test again to verify");
  console.log("3. Check Lighthouse scores for improvement");
}

testAllAssets().catch(console.error);
