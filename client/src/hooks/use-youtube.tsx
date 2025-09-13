import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface YouTubeVideo {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount?: number;
  likeCount?: number;
}

export function useYouTube() {
  const {
    data: videos,
    isLoading,
    error,
  } = useQuery<YouTubeVideo[]>({
    queryKey: ["api", "youtube", "videos"],
    queryFn: async () => {
      const response = await fetch("/api/youtube/videos");
      if (!response.ok) {
        throw new Error("Failed to fetch YouTube videos");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    videos: videos || [],
    isLoading,
    error,
  };
}

export function useYouTubePlayer(videoId: string) {
  const [player, setPlayer] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame Player API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      const newPlayer = new window.YT.Player(`youtube-player-${videoId}`, {
        height: "315",
        width: "560",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            setIsReady(true);
          },
        },
      });
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const playVideo = () => player?.playVideo();
  const pauseVideo = () => player?.pauseVideo();
  const stopVideo = () => player?.stopVideo();

  return {
    player,
    isReady,
    playVideo,
    pauseVideo,
    stopVideo,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
