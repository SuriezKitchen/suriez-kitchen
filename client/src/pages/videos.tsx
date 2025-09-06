import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { useYouTube } from '@/hooks/use-youtube';

export default function Videos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const { videos: youtubeVideos, isLoading, error } = useYouTube();

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

  // Mock Instagram videos for demonstration
  const instagramVideos = [
    {
      id: 'ig1',
      platform: 'instagram',
      title: 'Quick Pasta Tip',
      description: 'A 30-second tip for perfect al-dente pasta every time',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      url: 'https://instagram.com/chef.isabella',
      duration: '0:30',
      views: '15.2K',
      likes: '892'
    },
    {
      id: 'ig2',
      platform: 'instagram',
      title: 'Plating Like a Pro',
      description: 'Learn the art of beautiful food presentation',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      url: 'https://instagram.com/chef.isabella',
      duration: '1:15',
      views: '23.8K',
      likes: '1.4K'
    },
    {
      id: 'ig3',
      platform: 'instagram',
      title: 'Kitchen Essentials',
      description: 'Must-have tools for every home chef',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      url: 'https://instagram.com/chef.isabella',
      duration: '0:45',
      views: '18.5K',
      likes: '967'
    }
  ];

  // Transform YouTube videos to match our format
  const formattedYouTubeVideos = youtubeVideos.map(video => ({
    id: video.youtubeId,
    platform: 'youtube',
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    duration: 'Watch on YouTube',
    views: video.viewCount ? `${video.viewCount.toLocaleString()}` : 'N/A',
    likes: video.likeCount ? `${video.likeCount.toLocaleString()}` : 'N/A'
  }));

  const allVideos = [...formattedYouTubeVideos, ...instagramVideos];
  const filteredVideos = allVideos.filter(video => 
    selectedPlatform === 'all' || video.platform === selectedPlatform
  );

  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
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
                <Card key={i}>
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
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
          <div className="text-center mb-16 scroll-reveal">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6" data-testid="videos-page-title">
              Video Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="videos-page-description">
              Follow my culinary journey through engaging videos, cooking tutorials, and behind-the-scenes content 
              across YouTube and Instagram.
            </p>
            
            {/* Back to Home Link */}
            <Link href="/">
              <Button variant="outline" className="mb-8" data-testid="back-to-home-videos">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Platform Filter */}
          <div className="flex justify-center mb-12 scroll-reveal">
            <div className="flex gap-3">
              <Button
                variant={selectedPlatform === 'all' ? "default" : "outline"}
                onClick={() => setSelectedPlatform('all')}
                className={selectedPlatform === 'all' ? 'btn-primary' : ''}
                data-testid="platform-filter-all"
              >
                <i className="fas fa-video mr-2"></i>
                All Videos
              </Button>
              <Button
                variant={selectedPlatform === 'youtube' ? "default" : "outline"}
                onClick={() => setSelectedPlatform('youtube')}
                className={selectedPlatform === 'youtube' ? 'btn-primary' : ''}
                data-testid="platform-filter-youtube"
              >
                <i className="fab fa-youtube mr-2"></i>
                YouTube
              </Button>
              <Button
                variant={selectedPlatform === 'instagram' ? "default" : "outline"}
                onClick={() => setSelectedPlatform('instagram')}
                className={selectedPlatform === 'instagram' ? 'btn-primary' : ''}
                data-testid="platform-filter-instagram"
              >
                <i className="fab fa-instagram mr-2"></i>
                Instagram
              </Button>
            </div>
          </div>

          {/* Error State for YouTube */}
          {error && selectedPlatform !== 'instagram' && (
            <div className="mb-8 scroll-reveal">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-2xl mx-auto text-center">
                <i className="fab fa-youtube text-4xl text-destructive mb-3"></i>
                <p className="text-destructive font-medium mb-2">YouTube API Configuration Missing</p>
                <p className="text-muted-foreground text-sm">
                  Unable to load YouTube videos. Please configure the YouTube API keys to see the latest content.
                </p>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video, index) => (
              <div key={video.id} className="scroll-reveal video-hover group" style={{ animationDelay: `${index * 0.05}s` }}>
                <Card className="bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="relative cursor-pointer" onClick={() => openVideo(video.url)}>
                    <img 
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-64 object-cover"
                      data-testid={`video-thumbnail-${video.id}`}
                    />
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        video.platform === 'youtube' ? 'bg-red-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'
                      }`}>
                        <i className={`fab fa-${video.platform} mr-1`}></i>
                        {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </span>
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className={`rounded-full w-16 h-16 flex items-center justify-center text-white transition-all transform scale-75 group-hover:scale-100 ${
                          video.platform === 'youtube' ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        }`}
                        data-testid={`video-play-${video.id}`}
                      >
                        <i className="fas fa-play text-xl ml-1"></i>
                      </button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-semibold mb-2" data-testid={`video-title-${video.id}`}>
                      {video.title.length > 60 ? `${video.title.substring(0, 60)}...` : video.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed" data-testid={`video-description-${video.id}`}>
                      {video.description.length > 100 ? `${video.description.substring(0, 100)}...` : video.description}
                    </p>
                    
                    {/* Video Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                      <span className="flex items-center">
                        <i className="far fa-eye mr-2"></i>
                        <span data-testid={`video-views-${video.id}`}>{video.views} views</span>
                      </span>
                      <span className="flex items-center">
                        <i className="far fa-heart mr-2"></i>
                        <span data-testid={`video-likes-${video.id}`}>{video.likes} likes</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredVideos.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                <i className="fas fa-video text-6xl text-muted-foreground mb-6"></i>
                <h3 className="font-serif text-2xl font-semibold mb-4">No Videos Found</h3>
                <p className="text-muted-foreground">
                  {selectedPlatform === 'all' 
                    ? 'No videos are available at the moment. Check back soon for new content!'
                    : `No ${selectedPlatform} videos are currently available.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-20 text-center scroll-reveal">
            <h2 className="font-serif text-3xl font-bold mb-8">Follow My Journey</h2>
            <div className="flex justify-center gap-6">
              <a 
                href="https://youtube.com/@chefisabellacooks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <i className="fab fa-youtube text-3xl mb-3"></i>
                  <h3 className="font-semibold">YouTube Channel</h3>
                  <p className="text-red-100 text-sm">Subscribe for tutorials</p>
                </div>
              </a>
              <a 
                href="https://instagram.com/chef.isabella" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <i className="fab fa-instagram text-3xl mb-3"></i>
                  <h3 className="font-semibold">Instagram</h3>
                  <p className="text-purple-100 text-sm">Daily cooking tips</p>
                </div>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 scroll-reveal">
            <div className="bg-card rounded-xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{allVideos.length}</div>
                  <div className="text-muted-foreground">Total Videos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-muted-foreground">YouTube Subscribers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">25K+</div>
                  <div className="text-muted-foreground">Instagram Followers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">500K+</div>
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