import { useEffect } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import GallerySection from "@/components/gallery-section";
import VideosSection from "@/components/videos-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import TestimonialsSection from "@/components/testimonials-section";

export default function Home() {
  useEffect(() => {
    // Scroll reveal animation handler
    const revealElements = () => {
      const reveals = document.querySelectorAll(
        ".scroll-reveal:not(.revealed)"
      );

      reveals.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add("revealed");
        }
      });
    };

    // Add scroll event listener
    const handleScroll = () => {
      revealElements();
    };

    window.addEventListener("scroll", handleScroll);

    // Run on page load
    revealElements();

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <GallerySection />
      <VideosSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
