import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Dish } from "@shared/schema";

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { data: dishes, isLoading } = useQuery<Dish[]>({
    queryKey: ["api", "dishes"],
  });

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

  if (isLoading) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dishes?.map((dish, index) => (
            <div
              key={dish.id}
              className="scroll-reveal group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={dish.imageUrl}
                    alt={dish.title}
                    className="w-full h-64 object-cover image-hover"
                    data-testid={`dish-image-${dish.id}`}
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
                <CardContent className="p-6">
                  <h3
                    className="font-serif text-xl font-semibold mb-2"
                    data-testid={`dish-title-${dish.id}`}
                  >
                    {dish.title}
                  </h3>
                  <p
                    className="text-muted-foreground"
                    data-testid={`dish-description-${dish.id}`}
                  >
                    {dish.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
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
