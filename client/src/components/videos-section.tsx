import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useYouTube } from "@/hooks/use-youtube";
import OptimizedImage from "./optimized-image";

export default function VideosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { videos, isLoading, error } = useYouTube();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate videos every 5 seconds
  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [videos.length]);

  const goToNext = () => {
    if (isTransitioning || videos.length <= 1) return;
    setIsTransitioning(true);
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning || videos.length <= 1) return;
    setIsTransitioning(true);
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToVideo = (index: number) => {
    if (isTransitioning || index === currentVideoIndex) return;
    setIsTransitioning(true);
    setCurrentVideoIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const openVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank");
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && videos.length > 1) {
      goToNext();
    }
    if (isRightSwipe && videos.length > 1) {
      goToPrevious();
    }
  };

  if (error) {
    return (
      <section id="videos" className="py-20 bg-muted" ref={sectionRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Behind the Scenes
            </h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-destructive font-medium mb-2">
                Unable to Load YouTube Videos
              </p>
              <p className="text-muted-foreground text-sm">
                Please check that the YouTube API is properly configured with
                valid API keys.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="videos" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl">
              <Skeleton className="h-80 w-full" />
              <CardContent className="p-8">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-20 bg-muted" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 scroll-reveal">
          <h2
            className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6"
            data-testid="videos-title"
          >
            Behind the Scenes
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            data-testid="videos-description"
          >
            Follow along as I share cooking tips, techniques, and the stories
            behind my favorite recipes through my YouTube vlogs.
          </p>
        </div>

        <div className="relative">
          {videos.length > 0 ? (
            <>
              {/* Navigation Arrows - Hidden on mobile/tablet, visible on desktop */}
              {videos.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden lg:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 hover:bg-white shadow-lg"
                    onClick={goToPrevious}
                    disabled={isTransitioning}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden lg:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 hover:bg-white shadow-lg"
                    onClick={goToNext}
                    disabled={isTransitioning}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </Button>
                </>
              )}

              <div className="relative overflow-hidden">
                {/* Carousel Container */}
                <div
                  ref={carouselRef}
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentVideoIndex * 100}%)`,
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {videos.map((video, index) => (
                    <div key={video.youtubeId} className="w-full flex-shrink-0">
                      <div className="flex justify-center px-4">
                        <Card className="bg-card overflow-hidden shadow-lg w-full max-w-4xl">
                          <div
                            className="relative cursor-pointer group"
                            onClick={() => openVideo(video.youtubeId)}
                          >
                            <OptimizedImage
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                              dataTestId={`video-thumbnail-${video.youtubeId}`}
                              width={400}
                              height={320}
                              fallbackSrc={video.thumbnailUrl}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                              <button
                                className="bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center hover:bg-red-700 transition-all transform group-hover:scale-110"
                                data-testid={`video-play-${video.youtubeId}`}
                                aria-label={`Play video: ${video.title}`}
                              >
                                <i className="fas fa-play text-2xl ml-1" aria-hidden="true"></i>
                              </button>
                            </div>
                          </div>
                          <CardContent className="p-8">
                            <h3
                              className="font-serif text-2xl font-semibold mb-4"
                              data-testid={`video-title-${video.youtubeId}`}
                            >
                              {video.title.length > 80
                                ? `${video.title.substring(0, 80)}...`
                                : video.title}
                            </h3>
                            <p
                              className="text-muted-foreground mb-6 text-lg leading-relaxed"
                              data-testid={`video-description-${video.youtubeId}`}
                            >
                              {video.description.length > 150
                                ? `${video.description.substring(0, 150)}...`
                                : video.description}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground gap-6">
                              <span className="flex items-center">
                                <i className="far fa-eye mr-2"></i>
                                <span
                                  data-testid={`video-views-${video.youtubeId}`}
                                >
                                  {video.viewCount
                                    ? `${video.viewCount.toLocaleString()} views`
                                    : "Views unavailable"}
                                </span>
                              </span>
                              <span className="flex items-center">
                                <i className="far fa-heart mr-2"></i>
                                <span
                                  data-testid={`video-likes-${video.youtubeId}`}
                                >
                                  {video.likeCount
                                    ? `${video.likeCount.toLocaleString()} likes`
                                    : "Likes unavailable"}
                                </span>
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video indicators */}
              {videos.length > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {videos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToVideo(index)}
                      disabled={isTransitioning}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentVideoIndex
                          ? "bg-primary"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`Go to video ${index + 1} of ${videos.length}`}
                      aria-current={index === currentVideoIndex ? "true" : "false"}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Fallback content when no videos are available
            <div className="text-center py-12">
              <div className="bg-card rounded-xl p-8 max-w-md mx-auto">
                <i className="fab fa-youtube text-6xl text-primary mb-4"></i>
                <h3 className="font-serif text-xl font-semibold mb-2">
                  No Videos Available
                </h3>
                <p className="text-muted-foreground">
                  YouTube videos will appear here once the API is configured
                  properly.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/videos">
              <span
                className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-white font-medium rounded-lg inline-block cursor-pointer w-fit"
                data-testid="button-view-all-videos"
              >
                <i className="fas fa-video mr-2"></i>
                View All Videos
              </span>
            </Link>
            <button
              className="bg-primary hover:bg-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors w-fit"
              onClick={() =>
                window.open("https://youtube.com/@Sureiyahsaid", "_blank")
              }
              data-testid="button-subscribe-youtube"
            >
              <i className="fab fa-youtube mr-2"></i>
              Subscribe to My Channel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
