import { useEffect } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import LazySection from "@/components/lazy-section";

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
      <LazySection importFunc={() => import("@/components/gallery-section")} />
      <LazySection importFunc={() => import("@/components/videos-section")} />
      <LazySection
        importFunc={() => import("@/components/testimonials-section")}
      />
      <LazySection importFunc={() => import("@/components/about-section")} />
      <LazySection importFunc={() => import("@/components/contact-section")} />
      <LazySection importFunc={() => import("@/components/footer")} />
    </div>
  );
}
