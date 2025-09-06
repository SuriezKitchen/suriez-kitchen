import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useYouTube } from '@/hooks/use-youtube';

export default function VideosSection() {
  const sectionRef = useRef<HTMLSection>(null);
  const { videos, isLoading, error } = useYouTube();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const reveals = entry.target.querySelectorAll('.scroll-reveal');
          reveals.forEach((reveal, index) => {
            setTimeout(() => {
              reveal.classList.add('revealed');
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

  const openVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
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
              <p className="text-destructive font-medium mb-2">Unable to Load YouTube Videos</p>
              <p className="text-muted-foreground text-sm">
                Please check that the YouTube API is properly configured with valid API keys.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-20 bg-muted" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="videos-title">
            Behind the Scenes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="videos-description">
            Follow along as I share cooking tips, techniques, and the stories behind my favorite recipes through my YouTube vlogs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <div key={video.youtubeId} className="scroll-reveal video-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card className="bg-card overflow-hidden shadow-lg">
                  <div className="relative cursor-pointer" onClick={() => openVideo(video.youtubeId)}>
                    <img 
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-64 object-cover"
                      data-testid={`video-thumbnail-${video.youtubeId}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center hover:bg-accent transition-colors"
                        data-testid={`video-play-${video.youtubeId}`}
                      >
                        <i className="fas fa-play text-xl ml-1"></i>
                      </button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-semibold mb-2" data-testid={`video-title-${video.youtubeId}`}>
                      {video.title.length > 60 ? `${video.title.substring(0, 60)}...` : video.title}
                    </h3>
                    <p className="text-muted-foreground mb-4" data-testid={`video-description-${video.youtubeId}`}>
                      {video.description.length > 100 ? `${video.description.substring(0, 100)}...` : video.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <i className="far fa-eye mr-2"></i>
                      <span className="mr-4" data-testid={`video-views-${video.youtubeId}`}>
                        {video.viewCount ? `${video.viewCount.toLocaleString()} views` : 'Views unavailable'}
                      </span>
                      <i className="far fa-heart mr-2"></i>
                      <span data-testid={`video-likes-${video.youtubeId}`}>
                        {video.likeCount ? `${video.likeCount.toLocaleString()} likes` : 'Likes unavailable'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            // Fallback content when no videos are available
            <div className="col-span-full text-center py-12">
              <div className="bg-card rounded-xl p-8 max-w-md mx-auto">
                <i className="fab fa-youtube text-6xl text-primary mb-4"></i>
                <h3 className="font-serif text-xl font-semibold mb-2">No Videos Available</h3>
                <p className="text-muted-foreground">
                  YouTube videos will appear here once the API is configured properly.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mt-12">
          <button 
            className="bg-primary hover:bg-accent text-white px-8 py-4 rounded-lg font-medium transition-colors"
            onClick={() => window.open('https://youtube.com/@chefisabellacooks', '_blank')}
            data-testid="button-subscribe-youtube"
          >
            <i className="fab fa-youtube mr-2"></i>
            Subscribe to My Channel
          </button>
        </div>
      </div>
    </section>
  );
}
