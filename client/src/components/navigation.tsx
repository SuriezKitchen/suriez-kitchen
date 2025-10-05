import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import SuriezLogo from "./suriez-logo";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    setIsMobileMenuOpen(false);
    if (location !== "/" && sectionId) {
      // If not on home page and trying to navigate to a section, go to home page
      window.location.href = `/#${sectionId}`;
    } else if (sectionId && location === "/") {
      // If on home page, scroll to section
      scrollToSection(sectionId);
    }
    // For dedicated pages, Link component will handle navigation
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isMobileMenuOpen
          ? "navbar-bg border-b border-border"
          : isScrolled
          ? "navbar-bg border-b border-border"
          : location === "/"
          ? "bg-transparent"
          : "bg-foreground"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <SuriezLogo
              size="md"
              className={cn(
                "transition-all duration-300",
                isMobileMenuOpen || isScrolled ? "opacity-90" : "opacity-100"
              )}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation("/", "home")}
              className={cn(
                "hover:text-primary transition-colors",
                isScrolled
                  ? "text-muted-foreground"
                  : "text-white/90 hover:text-white"
              )}
              data-testid="nav-home"
            >
              Home
            </button>
            <Link href="/gallery">
              <span
                className={cn(
                  "hover:text-primary transition-colors cursor-pointer",
                  isScrolled
                    ? "text-muted-foreground"
                    : "text-white/90 hover:text-white"
                )}
                data-testid="nav-gallery"
              >
                Gallery
              </span>
            </Link>
            <Link href="/videos">
              <span
                className={cn(
                  "hover:text-primary transition-colors cursor-pointer",
                  isScrolled
                    ? "text-muted-foreground"
                    : "text-white/90 hover:text-white"
                )}
                data-testid="nav-videos"
              >
                Videos
              </span>
            </Link>
            <Link href="/contact">
              <span
                className={cn(
                  "hover:text-primary transition-colors cursor-pointer",
                  isScrolled
                    ? "text-muted-foreground"
                    : "text-white/90 hover:text-white"
                )}
                data-testid="nav-contact"
              >
                Contact
              </span>
            </Link>
            <a
              href="/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 shadow-lg cursor-pointer inline-block"
              )}
              data-testid="nav-portal"
            >
              <i className="fas fa-user-shield mr-2"></i>
              Portal
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden transition-colors p-3",
              isMobileMenuOpen || isScrolled ? "text-primary" : "text-white"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-button"
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={isMobileMenuOpen}
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <i className="fas fa-bars text-xl" aria-hidden="true"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className={cn(
              "md:hidden mt-4 py-4 border-t transition-colors",
              isScrolled ? "border-border" : "border-white/20"
            )}
          >
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavigation("/", "home")}
                className={cn(
                  "hover:text-primary transition-colors text-left",
                  isMobileMenuOpen || isScrolled
                    ? "text-muted-foreground"
                    : "text-white/90 hover:text-white"
                )}
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <Link href="/gallery">
                <span
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "hover:text-primary transition-colors text-left cursor-pointer block",
                    isMobileMenuOpen || isScrolled
                      ? "text-muted-foreground"
                      : "text-white/90 hover:text-white"
                  )}
                  data-testid="mobile-nav-gallery"
                >
                  Gallery
                </span>
              </Link>
              <Link href="/videos">
                <span
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "hover:text-primary transition-colors text-left cursor-pointer block",
                    isMobileMenuOpen || isScrolled
                      ? "text-muted-foreground"
                      : "text-white/90 hover:text-white"
                  )}
                  data-testid="mobile-nav-videos"
                >
                  Videos
                </span>
              </Link>
              <Link href="/contact">
                <span
                  className={cn(
                    "hover:text-primary transition-colors text-left cursor-pointer",
                    isMobileMenuOpen || isScrolled
                      ? "text-muted-foreground"
                      : "text-white/90 hover:text-white"
                  )}
                  data-testid="mobile-nav-contact"
                >
                  Contact
                </span>
              </Link>
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-3 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 shadow-lg cursor-pointer inline-block mt-2 w-fit"
                data-testid="mobile-nav-portal"
              >
                <i className="fas fa-user-shield mr-2"></i>
                Portal
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
