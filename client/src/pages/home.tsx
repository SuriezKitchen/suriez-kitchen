import { useEffect } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import GallerySection from "@/components/gallery-section";
import VideosSection from "@/components/videos-section";
import TestimonialsSection from "@/components/testimonials-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  useEffect(() => {
    // Use Intersection Observer instead of scroll events to avoid forced reflows
    const reveals = document.querySelectorAll(".scroll-reveal:not(.revealed)");

    if (reveals.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    reveals.forEach((reveal) => {
      observer.observe(reveal);
    });

    return () => observer.disconnect();
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
