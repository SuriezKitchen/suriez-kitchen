import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useYouTube, useYouTubeChannelStats } from "@/hooks/use-youtube";
import { useQuery } from "@tanstack/react-query";
import VideoCard from "@/components/video-card";

export default function Videos() {
  const sectionRef = useRef<HTMLElement>(null);
  const { videos: youtubeVideos, isLoading, error } = useYouTube();
  const { channelStats } = useYouTubeChannelStats();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Fetch local videos from database
  const { data: localVideos, isLoading: isLoadingLocalVideos } = useQuery({
    queryKey: ["api", "local-videos"],
    queryFn: async () => {
      const response = await fetch("/api/local-videos");
      if (!response.ok) throw new Error("Failed to fetch local videos");
      return response.json();
    },
  });

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const reveals = entry.target.querySelectorAll(".scroll-reveal");
          reveals.forEach((reveal, index) => {
            setTimeout(() => {
              reveal.classList.add("revealed");
            }, index * 50);
          });
        }
      });
    }, observerOptions);

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Transform YouTube videos to match our format
  const formattedYouTubeVideos = youtubeVideos.map((video) => ({
    id: video.youtubeId,
    platform: "youtube",
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    duration: "Watch on YouTube",
    views: video.viewCount ? `${video.viewCount.toLocaleString()}` : "N/A",
    likes: video.likeCount ? `${video.likeCount.toLocaleString()}` : "N/A",
  }));

  // Transform local videos to match our format
  const formattedLocalVideos = (localVideos || []).map((video: any) => ({
    id: video.id,
    platform: "local",
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.videoUrl,
    duration: video.duration,
    views: video.views,
    likes: video.likes,
  }));

  const allVideos = [...formattedLocalVideos, ...formattedYouTubeVideos];

  const openVideo = (url: string) => {
    window.open(url, "_blank");
  };

  const handleVideoPlay = (videoId: string) => {
    setPlayingVideo(videoId);
  };

  const handleVideoPause = () => {
    setPlayingVideo(null);
  };

  if (isLoading || isLoadingLocalVideos) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Skeleton className="h-16 w-96 mx-auto mb-6" />
              <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
              <div className="flex justify-center gap-4 mb-12">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="h-[500px] flex flex-col">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="px-4 pt-4 pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2 flex-1" />
                    <Skeleton className="h-4 w-2/3 mt-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20" ref={sectionRef}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 mt-8">
            <h1
              className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6"
              data-testid="videos-page-title"
            >
              Video Collection
            </h1>
            <p
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
              data-testid="videos-page-description"
            >
              Follow my culinary journey through engaging videos, cooking
              tutorials, and behind-the-scenes content across YouTube and
              Instagram.
            </p>

            {/* Back to Home Link */}
            <Link href="/">
              <Button
                variant="outline"
                className="mb-8"
                data-testid="back-to-home-videos"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Error State for YouTube */}
          {error && (
            <div className="mb-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-2xl mx-auto text-center">
                <i className="fab fa-youtube text-4xl text-destructive mb-3"></i>
                <p className="text-destructive font-medium mb-2">
                  YouTube API Configuration Missing
                </p>
                <p className="text-muted-foreground text-sm">
                  Unable to load YouTube videos. Please configure the YouTube
                  API keys to see the latest content.
                </p>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allVideos.map((video, index) => (
              <div
                key={video.id}
                className="video-hover group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <VideoCard
                  video={video}
                  isPlaying={playingVideo === video.id}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onYouTubeClick={openVideo}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {allVideos.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                <i className="fas fa-video text-6xl text-muted-foreground mb-6"></i>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  No Videos Found
                </h3>
                <p className="text-muted-foreground">
                  No videos are available at the moment. Check back soon for new
                  content!
                </p>
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-20 text-center">
            <h2 className="font-serif text-3xl font-bold mb-8">
              Follow My Journey
            </h2>
            <div className="flex justify-center gap-6">
              <a
                href="https://youtube.com/@Sureiyahsaid"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform group-hover:-translate-y-2 w-48 h-32 flex flex-col items-center justify-center text-center">
                  <i className="fab fa-youtube text-3xl mb-3"></i>
                  <h3 className="font-semibold">YouTube Channel</h3>
                  <p className="text-red-100 text-sm">
                    Subscribe for tutorials
                  </p>
                </div>
              </a>
              <a
                href="https://instagram.com/suriez_kitchen"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all duration-300 transform group-hover:-translate-y-2 w-48 h-32 flex flex-col items-center justify-center text-center">
                  <i className="fab fa-instagram text-3xl mb-3"></i>
                  <h3 className="font-semibold">Instagram</h3>
                  <p className="text-purple-100 text-sm">Daily cooking tips</p>
                </div>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16">
            <div className="bg-card rounded-xl p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {allVideos.length}
                  </div>
                  <div className="text-muted-foreground">Total Videos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {`${channelStats?.formattedSubscribers || "0"}+`}
                  </div>
                  <div className="text-muted-foreground">
                    YouTube Subscribers
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {channelStats?.viewCount
                      ? channelStats.viewCount >= 1000000
                        ? `${(channelStats.viewCount / 1000000).toFixed(1)}M+`
                        : channelStats.viewCount >= 1000
                        ? `${(channelStats.viewCount / 1000).toFixed(0)}K+`
                        : `${channelStats.viewCount}+`
                      : "0+"}
                  </div>
                  <div className="text-muted-foreground">Total Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
