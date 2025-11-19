# R2 Storage Cache Configuration Guide

## Problem

Your R2 storage assets (6,984 KiB) have no cache policy, causing poor performance on repeat visits.

## Solution

Configure cache headers in your R2 bucket for different asset types.

## Cache Policies by Asset Type

### 1. Static Images (PNG, JPG, WebP)

```json
{
  "Cache-Control": "public, max-age=31536000, immutable"
}
```

- **Duration**: 1 year
- **Reason**: Images rarely change, safe for long-term caching

### 2. Video Files (MP4)

```json
{
  "Cache-Control": "public, max-age=2592000"
}
```

- **Duration**: 30 days
- **Reason**: Videos are large, but may be updated occasionally

### 3. Logo Files

```json
{
  "Cache-Control": "public, max-age=31536000, immutable"
}
```

- **Duration**: 1 year
- **Reason**: Logo rarely changes

## How to Configure in R2

### Option 1: R2 Dashboard

1. Go to your R2 bucket in Cloudflare dashboard
2. Navigate to "Settings" → "Cache"
3. Add cache rules for different file types

### Option 2: R2 API

```bash
# Set cache headers for all images
aws s3api put-object-tagging \
  --bucket your-bucket-name \
  --key "*.png" \
  --tagging 'TagSet=[{Key=Cache-Control,Value=public, max-age=31536000, immutable}]'
```

### Option 3: Cloudflare Workers (Recommended)

Create a worker to add cache headers:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Add cache headers based on file type
    if (url.pathname.match(/\.(png|jpg|jpeg|webp|gif)$/)) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
      return newResponse;
    }

    if (url.pathname.match(/\.(mp4|webm|mov)$/)) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Cache-Control", "public, max-age=2592000");
      return newResponse;
    }

    return fetch(request);
  },
};
```

## Expected Results

### Before (Current)

- R2 assets: No cache (6,984 KiB downloaded every time)
- YouTube thumbnails: 2-hour cache (73 KiB)
- **Total**: Poor repeat visit performance

### After (Optimized)

- R2 assets: 1-year cache (0 KiB on repeat visits)
- YouTube thumbnails: 2-hour cache (73 KiB)
- **Total**: Excellent repeat visit performance

## Performance Impact

### First Visit

- No change in loading time
- All assets downloaded as before

### Repeat Visits

- **R2 assets**: 0 KiB (cached)
- **YouTube thumbnails**: 0 KiB (cached for 2 hours)
- **Total savings**: ~7,057 KiB on repeat visits

### Lighthouse Score Improvement

- **Performance**: +10-15 points
- **Best Practices**: +5-10 points
- **Overall**: Significant improvement

## Next Steps

1. **Configure R2 cache headers** using one of the methods above
2. **Test the configuration** by checking response headers
3. **Run Lighthouse again** to verify improvements
4. **Monitor cache hit rates** in Cloudflare analytics

## Verification

After configuration, check headers with:

```bash
curl -I https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/suriez-logo.png
```

Should return:

```
Cache-Control: public, max-age=31536000, immutable
```
