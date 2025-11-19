import React from "react";
import { Card } from "@/components/ui/card";
import OptimizedImage from "./optimized-image";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl?: string;
    platform: "local";
    url?: string;
    duration?: string;
    views?: string;
    likes?: string;
  };
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onPause: () => void;
  className?: string;
  // Mark this card as highest priority for LCP (first visible card)
  priority?: boolean;
}

export default function VideoCard({
  video,
  isPlaying,
  onPlay,
  onPause,
  className = "",
  priority = false,
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
    <Card
      className={`${getCardClasses()} ${className} h-[700px] flex flex-col`}
    >
      <div className="relative flex-shrink-0">
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
                <OptimizedImage
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={getThumbnailClasses()}
                  dataTestId={`video-thumbnail-${video.id}`}
                  width={800}
                  height={500}
                  loading={priority ? "eager" : "lazy"}
                  fetchPriority={priority ? "high" : "auto"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  fallbackSrc={video.thumbnailUrl}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="rounded-full w-16 h-16 flex items-center justify-center text-white transition-all transform scale-75 group-hover:scale-100 bg-primary hover:bg-primary/90"
                    data-testid={`video-play-${video.id}`}
                    aria-label={`Play video: ${video.title}`}
                  >
                    <i className="fas fa-play text-xl ml-1" aria-hidden="true"></i>
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
          // Local video
          <div
            className="relative cursor-pointer group"
            onClick={() => window.open(video.videoUrl, "_blank")}
          >
            <OptimizedImage
              src={video.thumbnailUrl}
              alt={video.title}
              className={getThumbnailClasses()}
              dataTestId={`video-thumbnail-${video.id}`}
              width={800}
              height={500}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              fallbackSrc={video.thumbnailUrl}
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="rounded-full w-16 h-16 flex items-center justify-center text-white transition-all transform scale-75 group-hover:scale-100 bg-primary hover:bg-primary/80"
                data-testid={`video-play-${video.id}`}
                aria-label={`Play video: ${video.title}`}
              >
                <i className="fas fa-play text-xl ml-1" aria-hidden="true"></i>
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
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="font-semibold text-lg mb-2 line-clamp-2 flex-shrink-0">
          {video.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-grow">
          {video.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
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
