import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import type { Dish } from "@shared/schema";

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const categories = dishes
    ? [
        "all",
        ...Array.from(
          new Set(dishes.map((dish) => dish.category.toLowerCase()))
        ),
      ]
    : ["all"];
  const filteredDishes =
    dishes?.filter(
      (dish) =>
        selectedCategory === "all" ||
        dish.category.toLowerCase() === selectedCategory
    ) || [];

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
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-72 w-full" />
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
            <h1
              className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6"
              data-testid="gallery-page-title"
            >
              Culinary Gallery
            </h1>
            <p
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
              data-testid="gallery-page-description"
            >
              A collection of my culinary creations, each telling a unique story
              of flavor, technique, and artistry. Explore the passion and
              creativity behind every dish.
            </p>

            {/* Back to Home Link */}
            <Link href="/">
              <Button
                variant="outline"
                className="mb-8"
                data-testid="back-to-home"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12 scroll-reveal">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize ${
                    selectedCategory === category ? "btn-primary" : ""
                  }`}
                  data-testid={`category-filter-${category}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDishes.map((dish, index) => (
              <div
                key={dish.id}
                className="scroll-reveal group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[500px] flex flex-col">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <img
                      src={dish.imageUrl}
                      alt={dish.title}
                      className="w-full h-56 object-cover image-hover"
                      data-testid={`gallery-dish-image-${dish.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                          <span className="bg-primary/80 px-3 py-1 rounded-full text-sm font-medium">
                            {dish.category}
                          </span>
                          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition-colors">
                            <i
                              className="fas fa-heart text-lg"
                              data-testid={`gallery-dish-heart-${dish.id}`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3
                      className="font-serif text-xl font-semibold mb-3"
                      data-testid={`gallery-dish-title-${dish.id}`}
                    >
                      {dish.title}
                    </h3>
                    <p
                      className="text-muted-foreground leading-relaxed flex-1"
                      data-testid={`gallery-dish-description-${dish.id}`}
                    >
                      {dish.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border flex-shrink-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <i className="fas fa-utensils mr-2"></i>
                          {dish.category}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-calendar mr-2"></i>
                          {new Date(dish.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredDishes.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                <i className="fas fa-utensils text-6xl text-muted-foreground mb-6"></i>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  No Dishes Found
                </h3>
                <p className="text-muted-foreground">
                  No dishes match the selected category. Try selecting a
                  different category.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {dishes && dishes.length > 0 && (
            <div className="mt-20 text-center scroll-reveal">
              <div className="bg-card rounded-xl p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {dishes.length}
                    </div>
                    <div className="text-muted-foreground">Total Creations</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {categories.length - 1}
                    </div>
                    <div className="text-muted-foreground">Categories</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      100%
                    </div>
                    <div className="text-muted-foreground">Made with Love</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
