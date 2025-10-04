import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useYouTubeChannelStats } from "@/hooks/use-youtube";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { channelStats, isLoading: statsLoading } = useYouTubeChannelStats();

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
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-0 lg:space-x-[60px]">
          {/* Left Column - Image */}
          <div className="scroll-reveal">
            <div className="relative max-w-2xl">
              <img
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&fit=crop"
                alt="Suriez Kitchen"
                className="w-full h-[400px] lg:h-[600px] object-cover rounded-2xl shadow-2xl"
              />
              {/* Experience Badge */}
              <div className="absolute -bottom-4 -right-4 bg-green-600 text-white px-4 py-3 rounded-lg text-center">
                <div className="text-2xl font-bold">5+</div>
                <div className="text-xs font-medium">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="scroll-reveal space-y-8 max-w-lg">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                Meet Suriez Kitchen
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  From the heart of Tanzania to the world, my journey began far
                  from a professional kitchen. Though I studied Business
                  Administration, my true calling was discovered in the
                  comforting aromas and vibrant flavors that filled my home
                  growing up. What started as a simple curiosity soon blossomed
                  into a deep passion for creating dishes that connect people,
                  cultures, and memories.
                </p>
                <p>
                  Every meal I prepare is a reflection of where I come from — a
                  blend of African tradition, modern inspiration, and the joy of
                  sharing food that speaks to the soul.
                </p>
                <p>
                  Through my YouTube channel, I invite you into my kitchen to
                  explore the stories, flavors, and techniques that shape my
                  cooking. Whether you're an aspiring chef or someone who simply
                  loves good food, there's always something new and exciting to
                  discover together.
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-green-200 h-8 w-16 mx-auto rounded"></div>
                  ) : (
                    `${channelStats?.subscriberCount || 0}+`
                  )}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  YouTube subscribers
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
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-xl font-medium w-auto"
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
