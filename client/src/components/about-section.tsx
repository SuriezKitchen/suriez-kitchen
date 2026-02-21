import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  // Removed YouTube channel stats

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll(".scroll-reveal");
            reveals.forEach((el, i) => {
              setTimeout(() => el.classList.add("revealed"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-20 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Content */}
          <div className="scroll-reveal space-y-8 max-w-3xl">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
                Why Choose Us
              </h2>
              <div className="space-y-6">
                <div className="scroll-reveal">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Taste Flavors
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We create dishes that guests remember — balanced, rich in flavor, and beautifully prepared.
                  </p>
                </div>
                <div className="scroll-reveal">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Thoughtfully Planned Events
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Every event we cater is carefully planned to match your vision, style, and guest experience.
                  </p>
                </div>
                <div className="scroll-reveal">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Quality Ingredients
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We prioritize fresh, high-quality ingredients to ensure every dish meets our standards.
                  </p>
                </div>
                <div className="scroll-reveal">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Reliable & Professional Service
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our team works with care and attention to detail to deliver a smooth catering experience from start to finish.
                  </p>
                </div>
                <div className="scroll-reveal">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Menus That Fit Your Guests
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We offer a range of menu options, including vegetarian and Afro-fusion dishes, so every guest feels included.
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  100+
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Recipes shared
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  200+
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Recipes Created
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <Link href="/contact">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium w-auto">
                  <i className="fas fa-envelope mr-2"></i>
                  Get in Touch
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-2 border-border hover:border-primary text-foreground px-6 py-2 rounded-xl font-medium w-auto"
                onClick={() => {
                  // You can add resume download functionality here
                  window.open("#", "_blank");
                }}
              >
                <i className="fas fa-download mr-2"></i>
                Download Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
