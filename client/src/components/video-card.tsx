import { useState, useEffect } from "react";
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
  className = "" 
}: VideoCardProps) {
  const [aspectRatio, setAspectRatio] = useState<"landscape" | "portrait" | "square">("landscape");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Detect aspect ratio from thumbnail
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.2) {
        setAspectRatio("landscape");
      } else if (ratio < 0.8) {
        setAspectRatio("portrait");
      } else {
        setAspectRatio("square");
      }
      setImageLoaded(true);
    };
    img.src = video.thumbnailUrl;
  }, [video.thumbnailUrl]);

  const getCardClasses = () => {
    const baseClasses = "bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500";
    
    if (aspectRatio === "portrait") {
      return `${baseClasses} w-full col-span-full`; // Full width and span all columns
    }
    
    return baseClasses;
  };

  const getThumbnailClasses = () => {
    if (aspectRatio === "portrait") {
      return "w-full h-[60vh] object-cover"; // Full viewport height for portrait videos
    } else if (aspectRatio === "square") {
      return "w-full h-64 object-cover"; // Square videos
    } else {
      return "w-full h-48 object-cover"; // Standard landscape
    }
  };

  const getVideoClasses = () => {
    if (aspectRatio === "portrait") {
      return "w-full h-[60vh] object-contain bg-black"; // Full viewport height for portrait videos
    } else if (aspectRatio === "square") {
      return "w-full h-64 object-cover";
    } else {
      return "w-full h-48 object-cover";
    }
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
