import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl?: string;
    platform: "local" | "youtube";
    url?: string;
    duration?: string;
    views?: string;
    likes?: string;
  };
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onPause: () => void;
  onYouTubeClick?: (url: string) => void;
  className?: string;
}

export default function VideoCard({
  video,
  isPlaying,
  onPlay,
  onPause,
  onYouTubeClick,
  className = "",
}: VideoCardProps) {
  const [likes, setLikes] = useState(parseInt(video.likes || "0"));
  const [views, setViews] = useState(parseInt(video.views || "0"));
  const [isLiked, setIsLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const getCardClasses = () => {
    return "bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500";
  };

  const handleLike = async () => {
    if (isLiked || video.platform !== "local") return;
    
    try {
      const response = await fetch(`/api/videos/${video.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Failed to like video:", error);
    }
  };

  const handleView = async () => {
    if (hasViewed || video.platform !== "local") return;
    
    try {
      const response = await fetch(`/api/videos/${video.id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setViews(data.views);
        setHasViewed(true);
      }
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  const handlePlay = (id: string) => {
    handleView(); // Track view when video is played
    onPlay(id);
  };

  const getThumbnailClasses = () => {
    return "w-full h-[500px] object-cover"; // Reduced height to 300px
  };

  const getVideoClasses = () => {
    return "w-full h-[500px] object-cover"; // Reduced height to 300px
  };

  return (
    <Card className={`${getCardClasses()} ${className}`}>
      <div className="relative">
        {video.platform === "local" ? (
          // Local video player
          <div className="relative">
            {isPlaying ? (
              <video
                className={getVideoClasses()}
                controls
                autoPlay
                onPause={onPause}
                onEnded={onPause}
                data-testid={`video-player-${video.id}`}
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div
                className="relative cursor-pointer group"
                onClick={() => handlePlay(video.id)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={getThumbnailClasses()}
                  data-testid={`video-thumbnail-${video.id}`}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="rounded-full w-16 h-16 flex items-center justify-center text-white transition-all transform scale-75 group-hover:scale-100 bg-primary hover:bg-primary/90"
                    data-testid={`video-play-${video.id}`}
                  >
                    <i className="fas fa-play text-xl ml-1"></i>
                  </button>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // YouTube video
          <div
            className="relative cursor-pointer group"
            onClick={() => onYouTubeClick?.(video.url!)}
          >
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className={getThumbnailClasses()}
              data-testid={`video-thumbnail-${video.id}`}
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="rounded-full w-16 h-16 flex items-center justify-center text-white transition-all transform scale-75 group-hover:scale-100 bg-red-600 hover:bg-red-700"
                data-testid={`video-play-${video.id}`}
              >
                <i className="fas fa-play text-xl ml-1"></i>
              </button>
            </div>

            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2">
                <span className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {video.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <i className="fas fa-eye"></i>
              {views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <i className="fas fa-heart"></i>
              {likes.toLocaleString()} likes
            </span>
          </div>
          
          {/* Like Button - Only for local videos */}
          {video.platform === "local" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiked}
              className={`flex items-center gap-1 text-xs ${
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <i className={`fas fa-heart ${isLiked ? "text-red-500" : ""}`}></i>
              {isLiked ? "Liked!" : "Like"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
