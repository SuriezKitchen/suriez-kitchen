import { useEffect, useRef } from 'react';

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const reveals = entry.target.querySelectorAll('.scroll-reveal');
          reveals.forEach((reveal, index) => {
            setTimeout(() => {
              reveal.classList.add('revealed');
            }, index * 200);
          });
        }
      });
    }, observerOptions);

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-20 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-reveal">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=1000"
                  alt="Chef Isabella portrait"
                  className="rounded-2xl shadow-2xl w-full"
                  data-testid="chef-portrait"
                />
                <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 rounded-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold" data-testid="experience-years">5+</div>
                    <div className="text-sm">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="scroll-reveal">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="about-title">
                Meet Chef Isabella
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-testid="about-paragraph-1">
                From a small-town kitchen to culinary school and beyond, my journey has been fueled by an insatiable passion for creating memorable dining experiences. Each dish I craft tells a story of tradition, innovation, and the pure joy of sharing exceptional food.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="about-paragraph-2">
                Through my YouTube channel, I love sharing the techniques, stories, and inspirations behind my cooking. Whether you're a fellow chef or a home cooking enthusiast, there's always something new to discover in the kitchen together.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-card rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-2" data-testid="stat-subscribers">50K+</div>
                  <div className="text-muted-foreground">YouTube Subscribers</div>
                </div>
                <div className="text-center p-6 bg-card rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-2" data-testid="stat-recipes">200+</div>
                  <div className="text-muted-foreground">Recipes Created</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  className="btn-primary px-6 py-3 text-white font-medium rounded-lg"
                  onClick={() => {
                    const element = document.getElementById('contact');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  data-testid="button-get-in-touch"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Get in Touch
                </button>
                <button 
                  className="border border-border px-6 py-3 text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
                  data-testid="button-download-resume"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
