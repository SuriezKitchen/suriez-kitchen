import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      {/* Hero Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      >
        {/* Culinary source 1 (Coverr) */}
        <source
          src="https://cdn.coverr.co/videos/coverr-preparing-food-in-a-restaurant-kitchen-3175/1080p.mp4"
          type="video/mp4"
        />
        {/* Culinary source 2 (Pexels) */}
        <source
          src="https://videos.pexels.com/video-files/2796411/2796411-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
        {/* Reliable fallback (MDN Big Buck Bunny sample) */}
        <source
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          type="video/mp4"
        />
      </video>

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
          className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed"
          data-testid="hero-description"
        >
          Join Suriez Kitchen on a journey through flavors, techniques, and the
          stories behind every dish. From gourmet creations to behind-the-scenes
          vlogs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="btn-primary px-8 py-4 text-white font-medium rounded-lg"
            onClick={() => scrollToSection("videos")}
            data-testid="button-watch-vlogs"
          >
            <i className="fas fa-play mr-2"></i>
            Watch Latest Vlogs
          </button>
          <button
            className="border border-white/30 backdrop-blur-sm px-8 py-4 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
            onClick={() => scrollToSection("gallery")}
            data-testid="button-view-creations"
          >
            <i className="fas fa-utensils mr-2"></i>
            View Creations
          </button>
        </div>
      </div>

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
