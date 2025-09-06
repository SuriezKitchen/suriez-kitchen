import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    setIsMobileMenuOpen(false);
    if (location !== '/' && sectionId) {
      // If not on home page and trying to navigate to a section, go to home page
      window.location.href = `/#${sectionId}`;
    } else if (sectionId && location === '/') {
      // If on home page, scroll to section
      scrollToSection(sectionId);
    }
    // For dedicated pages, Link component will handle navigation
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "navbar-bg border-b border-border" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="font-serif text-2xl font-bold text-primary" data-testid="brand-logo">
            Chef Isabella
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('/', 'home')}
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="nav-home"
            >
              Home
            </button>
            <Link href="/gallery">
              <span 
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                data-testid="nav-gallery"
              >
                Gallery
              </span>
            </Link>
            <Link href="/videos">
              <span 
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                data-testid="nav-videos"
              >
                Videos
              </span>
            </Link>
            <button 
              onClick={() => handleNavigation('/', 'about')}
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="nav-about"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('/', 'contact')}
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => handleNavigation('/', 'home')}
                className="text-muted-foreground hover:text-primary transition-colors text-left"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <Link href="/gallery">
                <span 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left cursor-pointer block"
                  data-testid="mobile-nav-gallery"
                >
                  Gallery
                </span>
              </Link>
              <Link href="/videos">
                <span 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left cursor-pointer block"
                  data-testid="mobile-nav-videos"
                >
                  Videos
                </span>
              </Link>
              <button 
                onClick={() => handleNavigation('/', 'about')}
                className="text-muted-foreground hover:text-primary transition-colors text-left"
                data-testid="mobile-nav-about"
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('/', 'contact')}
                className="text-muted-foreground hover:text-primary transition-colors text-left"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
