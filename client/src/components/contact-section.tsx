import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { SocialLink } from "@shared/schema";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["api", "social-links"],
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

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, string> = {
      youtube: "fab fa-youtube",
      instagram: "fab fa-instagram",
      tiktok: "fab fa-tiktok",
      facebook: "fab fa-facebook",
      twitter: "fab fa-twitter",
    };
    return icons[platform.toLowerCase()] || "fas fa-link";
  };

  return (
    <section id="contact" className="py-20 bg-muted" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="scroll-reveal">
            <h2
              className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6"
              data-testid="contact-title"
            >
              Let's Create Together
            </h2>
            <p
              className="text-xl text-muted-foreground mb-12"
              data-testid="contact-description"
            >
              Whether you're looking for private chef services, cooking
              collaborations, or just want to chat about food, I'd love to hear
              from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="scroll-reveal text-center">
              <Card className="bg-card p-6 shadow-lg">
                <CardContent className="p-0">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-envelope text-lg text-primary"></i>
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">
                    Email Me
                  </h3>
                  <p
                    className="text-muted-foreground text-sm"
                    data-testid="contact-email"
                  >
                    sureiyah__@example.com
                  </p>
                </CardContent>
              </Card>
            </div>

            {socialLinks?.map((link, index) => (
              <div
                key={link.id}
                className="scroll-reveal text-center"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <Card className="bg-card p-6 shadow-lg">
                  <CardContent className="p-0">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i
                        className={`${getSocialIcon(
                          link.platform
                        )} text-lg text-primary`}
                      ></i>
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-2 capitalize">
                      {link.platform}
                    </h3>
                    <p
                      className="text-muted-foreground text-sm"
                      data-testid={`contact-${link.platform}`}
                    >
                      {link.username}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Default third card if no social links */}
            {(!socialLinks || socialLinks.length === 0) && (
              <>
                <div
                  className="scroll-reveal text-center"
                  style={{ animationDelay: "0.1s" }}
                >
                  <Card className="bg-card p-6 shadow-lg">
                    <CardContent className="p-0">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fab fa-youtube text-lg text-primary"></i>
                      </div>
                      <h3 className="font-serif text-lg font-semibold mb-2">
                        YouTube
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        @Sureiyahsaid
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div
                  className="scroll-reveal text-center"
                  style={{ animationDelay: "0.2s" }}
                >
                  <Card className="bg-card p-6 shadow-lg">
                    <CardContent className="p-0">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fab fa-instagram text-lg text-primary"></i>
                      </div>
                      <h3 className="font-serif text-lg font-semibold mb-2">
                        Instagram
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        @surez_kitchen
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          <div className="scroll-reveal">
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://youtube.com/@Sureiyahsaid"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-accent text-white p-4 rounded-full transition-colors"
                data-testid="social-link-youtube"
              >
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a
                href="https://instagram.com/surez_kitchen"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-accent text-white p-4 rounded-full transition-colors"
                data-testid="social-link-instagram"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a
                href="#"
                className="bg-primary hover:bg-accent text-white p-4 rounded-full transition-colors"
                data-testid="social-link-tiktok"
              >
                <i className="fab fa-tiktok text-xl"></i>
              </a>
              <a
                href="#"
                className="bg-primary hover:bg-accent text-white p-4 rounded-full transition-colors"
                data-testid="social-link-facebook"
              >
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a
                href="#"
                className="bg-primary hover:bg-accent text-white p-4 rounded-full transition-colors"
                data-testid="social-link-twitter"
              >
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
