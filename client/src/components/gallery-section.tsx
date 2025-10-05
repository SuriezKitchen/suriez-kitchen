import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResponsiveImage from "@/components/responsive-image";
import type { Dish } from "@shared/schema";

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const { data: dishes, isLoading, error } = useQuery<Dish[]>({
    queryKey: ["api", "dishes"],
  });

  // Compute dishes early so hooks below can depend on them
  const visibleDishes = (dishes || []).slice(0, 10);
  const loopDishes = [...visibleDishes, ...visibleDishes];

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

  // Auto-scroll the horizontal row continuously using requestAnimationFrame to avoid forced reflows
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    row.scrollLeft = 0;
    const speedPxPerSec = 60; // tune speed here
    let lastTime = 0;
    let half = 0;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= 16) {
        // ~60fps
        // Cache scrollWidth to avoid forced reflow
        if (half === 0) {
          half = Math.max(1, Math.floor(row.scrollWidth / 2));
        }

        const deltaTime = (currentTime - lastTime) / 1000;
        const stepPx = speedPxPerSec * deltaTime;

        row.scrollLeft += stepPx;
        if (row.scrollLeft >= half) {
          // jump instantly to create seamless loop
          row.scrollLeft -= half;
        }

        lastTime = currentTime;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [loopDishes.length]);

  // Show loading state only if we don't have dishes yet
  if (isLoading && !dishes) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 scroll-reveal">
          <h2
            className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6"
            data-testid="gallery-title"
          >
            Culinary Creations
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            data-testid="gallery-description"
          >
            Each dish tells a story of passion, precision, and creativity.
            Explore the artistry behind every plate.
          </p>
        </div>

        {/* Horizontal scroll row */}
        <div
          ref={rowRef}
          className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-6 pr-6 [&::-webkit-scrollbar]:hidden">
            {loopDishes.map((dish, index) => (
              <div
                key={`${dish.id}-${index}`}
                className="scroll-reveal group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-96 min-w-[14rem] sm:min-w-[16rem] md:min-w-[18rem] flex-shrink-0 flex flex-col">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <ResponsiveImage
                      src={dish.imageUrl}
                      alt={dish.title}
                      className="w-full h-48 object-cover image-hover"
                      dataTestId={`dish-image-${dish.id}`}
                      width={288}
                      height={192}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={75}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 text-white">
                        <i
                          className="fas fa-heart text-lg"
                          data-testid={`dish-heart-${dish.id}`}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3
                      className="font-serif text-xl font-semibold mb-2"
                      data-testid={`dish-title-${dish.id}`}
                    >
                      {dish.title}
                    </h3>
                    <p
                      className="text-muted-foreground flex-1"
                      data-testid={`dish-description-${dish.id}`}
                    >
                      {dish.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/gallery">
            <span
              className="btn-primary px-8 py-4 text-white font-medium rounded-lg inline-block cursor-pointer"
              data-testid="button-view-full-gallery"
            >
              View Full Gallery
              <i className="fas fa-arrow-right ml-2"></i>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
