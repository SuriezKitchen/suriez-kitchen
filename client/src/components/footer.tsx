import SuriezLogo from "./suriez-logo";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3
              className="font-serif text-2xl font-bold mb-4 text-primary"
              data-testid="footer-brand"
            >
              Suriez Kitchen
            </h3>
            <p
              className="text-gray-300 leading-relaxed"
              data-testid="footer-description"
            >
              Crafting culinary experiences that celebrate flavor, technique,
              and the joy of sharing exceptional food.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("gallery")}
                  className="text-gray-300 hover:text-primary transition-colors text-left"
                  data-testid="footer-link-gallery"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("videos")}
                  className="text-gray-300 hover:text-primary transition-colors text-left"
                  data-testid="footer-link-videos"
                >
                  Videos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-300 hover:text-primary transition-colors text-left"
                  data-testid="footer-link-about"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-300 hover:text-primary transition-colors text-left"
                  data-testid="footer-link-contact"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Stay Connected</h4>
            <p className="text-gray-300 mb-4">
              Subscribe for the latest recipes and cooking tips!
            </p>
            <div className="flex space-x-3">
              <a
                href="https://youtube.com/@Sureiyahsaid"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors"
                data-testid="footer-social-youtube"
              >
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a
                href="https://instagram.com/sureiyah__"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors"
                data-testid="footer-social-instagram"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-primary transition-colors"
                data-testid="footer-social-tiktok"
              >
                <i className="fab fa-tiktok text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400" data-testid="footer-copyright">
            © 2024 Suriez Kitchen. Made with{" "}
            <i className="fas fa-heart text-primary"></i> for the love of
            cooking.
          </p>
        </div>
      </div>
    </footer>
  );
}
