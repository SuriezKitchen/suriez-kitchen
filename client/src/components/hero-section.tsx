import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Media carousel data - mix of videos and images
  const mediaItems = [
    {
      type: "video",
      src: "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/videos/sureiz-kitchen-assets_61678-500316021_tiny.mp4",
      alt: "Cooking preparation video"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      alt: "Beautiful dish presentation"
    },
    {
      type: "image", 
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      alt: "Gourmet cooking scene"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      alt: "Chef in action"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      alt: "Fresh ingredients"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-rotate media every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMediaIndex((prevIndex) => 
        (prevIndex + 1) % mediaItems.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [mediaItems.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Hero Background Media Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentMediaIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.type === "video" ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={item.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="hero-overlay absolute inset-0"></div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h1
          className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          data-testid="hero-title"
        >
          Culinary Artistry
          <span className="block text-secondary">Meets Passion</span>
        </h1>
        <p
          className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-sans"
          data-testid="hero-description"
          style={{
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          Join Suriez Kitchen on a journey through flavors, techniques, and the
          stories behind every dish. From gourmet creations to behind-the-scenes
          vlogs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/videos">
            <button
              className="btn-primary px-8 py-4 text-white font-medium rounded-lg"
              data-testid="button-watch-vlogs"
            >
              <i className="fas fa-play mr-2"></i>
              Watch Latest Vlogs
            </button>
          </Link>
          <Link href="/gallery">
            <button
              className="border border-white/30 backdrop-blur-sm px-8 py-4 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              data-testid="button-view-creations"
            >
              <i className="fas fa-utensils mr-2"></i>
              View Creations
            </button>
          </Link>
        </div>
      </div>

      {/* Carousel Navigation */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {mediaItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMediaIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentMediaIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to media ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentMediaIndex((prev) => 
          prev === 0 ? mediaItems.length - 1 : prev - 1
        )}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous media"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      <button
        onClick={() => setCurrentMediaIndex((prev) => 
          (prev + 1) % mediaItems.length
        )}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Next media"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
        data-testid="scroll-indicator"
      >
        <i className="fas fa-chevron-down text-2xl"></i>
      </div>
    </section>
  );
}
