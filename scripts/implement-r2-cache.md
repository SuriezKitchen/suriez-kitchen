# Implement R2 Cache Headers - Step by Step

## Current Issue

Your R2 video file (8,953 KiB) has no cache policy, causing poor repeat visit performance.

## Solution

Configure cache headers in your R2 bucket to fix this issue.

## Step 1: Access Your R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage**
3. Find your bucket: `sureiz-kitchen-assets` (or similar)
4. Click on the bucket name

## Step 2: Configure Cache Headers

### Option A: Using R2 Dashboard (Easiest)

1. In your R2 bucket, go to **Settings** tab
2. Look for **Cache** or **Headers** section
3. Add the following cache rules:

#### For Video Files (.mp4, .webm, .mov):

```
Cache-Control: public, max-age=2592000
```

- **Duration**: 30 days (2,592,000 seconds)
- **Reason**: Videos are large but may be updated occasionally

#### For Image Files (.png, .jpg, .jpeg, .webp):

```
Cache-Control: public, max-age=31536000, immutable
```

- **Duration**: 1 year (31,536,000 seconds)
- **Reason**: Images rarely change, safe for long-term caching

### Option B: Using Cloudflare Workers (Recommended)

1. Go to **Workers & Pages** in Cloudflare Dashboard
2. Create a new Worker
3. Use this code:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Add cache headers based on file type
    if (url.pathname.match(/\.(mp4|webm|mov)$/)) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Cache-Control", "public, max-age=2592000");
      return newResponse;
    }

    if (url.pathname.match(/\.(png|jpg|jpeg|webp|gif)$/)) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
      return newResponse;
    }

    return fetch(request);
  },
};
```

4. Deploy the worker
5. Set up a custom domain or route to your R2 bucket

### Option C: Using R2 API

If you have AWS CLI configured for R2:

```bash
# Set cache headers for video files
aws s3api put-object-tagging \
  --bucket your-bucket-name \
  --key "*.mp4" \
  --tagging 'TagSet=[{Key=Cache-Control,Value=public, max-age=2592000}]' \
  --endpoint-url https://your-account-id.r2.cloudflarestorage.com

# Set cache headers for image files
aws s3api put-object-tagging \
  --bucket your-bucket-name \
  --key "*.png" \
  --tagging 'TagSet=[{Key=Cache-Control,Value=public, max-age=31536000, immutable}]' \
  --endpoint-url https://your-account-id.r2.cloudflarestorage.com
```

## Step 3: Verify the Configuration

After implementing cache headers, test with:

```bash
curl -I https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/videos/sureiz-kitchen-assets_61678-500316021_tiny.mp4
```

You should see:

```
Cache-Control: public, max-age=2592000
```

## Expected Results

### Before (Current):

- R2 video: No cache (8,953 KiB downloaded every time)
- **Total cache issue**: 8,953 KiB

### After (Optimized):

- R2 video: 30-day cache (0 KiB on repeat visits)
- **Total cache issue**: 0 KiB

### Performance Impact:

- **Repeat visits**: 8,953 KiB faster loading
- **Lighthouse score**: +10-15 points improvement
- **User experience**: Much faster repeat visits

## Priority Actions

1. **Immediate**: Configure R2 cache headers (this will fix the main issue)
2. **Optional**: Consider moving large videos to Vercel storage for better cache control
3. **Future**: Monitor cache hit rates in Cloudflare analytics

## Troubleshooting

If you can't find the cache settings in R2 dashboard:

1. Check if you have the right permissions
2. Try using Cloudflare Workers (most reliable method)
3. Contact Cloudflare support for R2 cache configuration help

The main goal is to get that 8,953 KiB video file cached properly!
