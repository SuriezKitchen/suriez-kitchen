export const onRequest: PagesFunction<{
  YOUTUBE_API_KEY: string;
  YOUTUBE_CHANNEL_ID: string;
}> = async (context) => {
  try {
    const apiKey = context.env.YOUTUBE_API_KEY;
    const channelId = context.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return new Response(
        JSON.stringify({ message: "YouTube API configuration missing" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch channel statistics from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }

    const stats = data.items[0].statistics;

    // Format subscriber count
    const subscriberCount = parseInt(stats.subscriberCount);
    let formattedSubscribers = subscriberCount.toString();

    if (subscriberCount >= 1000000) {
      formattedSubscribers = (subscriberCount / 1000000).toFixed(1) + "M";
    } else if (subscriberCount >= 1000) {
      formattedSubscribers = (subscriberCount / 1000).toFixed(1) + "K";
    }

    const channelStats = {
      subscriberCount,
      formattedSubscribers,
      videoCount: parseInt(stats.videoCount),
      viewCount: parseInt(stats.viewCount),
    };

    return new Response(JSON.stringify(channelStats), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600", // Cache for 10 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching YouTube channel stats:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch channel statistics" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
