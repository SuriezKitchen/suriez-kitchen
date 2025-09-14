import { useEffect, useRef } from "react";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Amara O.",
    role: "Food Blogger",
    quote:
      "Suriez Kitchen elevates familiar flavors with incredible finesse. Every plate feels thoughtful and balanced.",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
  {
    name: "Daniel K.",
    role: "Culinary Enthusiast",
    quote:
      "The textures and aromas are unforgettable. You can taste the precision and love in each bite.",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
  {
    name: "Lola A.",
    role: "Event Planner",
    quote:
      "Elegant presentation, calm and natural palette, and remarkable consistency. Guests were delighted!",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll(".scroll-reveal");
            reveals.forEach((el, i) => {
              setTimeout(() => el.classList.add("revealed"), i * 80);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      className="py-20 bg-secondary/40"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 scroll-reveal">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Testimonials
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A few notes from diners and partners who’ve experienced Suriez
            Kitchen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="scroll-reveal bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <blockquote className="text-foreground leading-relaxed text-sm">
                "{t.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
