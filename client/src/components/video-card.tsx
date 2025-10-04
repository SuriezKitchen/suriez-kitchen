import React from "react";
import { Card } from "@/components/ui/card";

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
  const getCardClasses = () => {
    return "bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500";
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
                muted
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
                onClick={() => onPlay(video.id)}
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
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {video.views && (
            <span className="flex items-center gap-1">
              <i className="fas fa-eye"></i>
              {video.views}
            </span>
          )}
          {video.likes && (
            <span className="flex items-center gap-1">
              <i className="fas fa-heart"></i>
              {video.likes}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
