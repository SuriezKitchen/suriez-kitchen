import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import type { SocialLink } from "@shared/schema";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Hardcoded social links - no API needed
  const socialLinks: SocialLink[] = [
    {
      id: "instagram",
      platform: "instagram",
      username: "@suriezkitchen",
      url: "https://instagram.com/suriezkitchen",
    },
  ];

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create WhatsApp message
      const whatsappMessage = `New Contact Form Submission:
      
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}
Inquiry Type: ${formData.inquiryType}

Message:
${formData.message}`;

      // Create email subject and body
      const emailSubject = `Contact Form: ${formData.subject}`;
      const emailBody = `Name: ${formData.name}
Email: ${formData.email}
Inquiry Type: ${formData.inquiryType}

Message:
${formData.message}`;

      // Encode for URLs
      const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);
      const encodedEmailSubject = encodeURIComponent(emailSubject);
      const encodedEmailBody = encodeURIComponent(emailBody);

      // Your WhatsApp number (replace with your actual number)
      const whatsappNumber = "255789779995"; // Replace with your WhatsApp number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedWhatsappMessage}`;

      // Your email (replace with your actual email)
      const emailAddress = "sureiyah__@example.com"; // Replace with your email
      const emailUrl = `mailto:${emailAddress}?subject=${encodedEmailSubject}&body=${encodedEmailBody}`;

      // Open WhatsApp and email
      window.open(whatsappUrl, "_blank");
      window.open(emailUrl, "_blank");

      // Show success message
      toast({
        title: "Message Sent!",
        description:
          "Your message has been sent to WhatsApp and email. Thank you for contacting us!",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: "fab fa-instagram",
      tiktok: "fab fa-tiktok",
      facebook: "fab fa-facebook",
      twitter: "fab fa-twitter",
    };
    return icons[platform.toLowerCase()] || "fas fa-link";
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section id="contact" className="py-20 bg-background" ref={sectionRef}>
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16 mt-8">
            <h1
              className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6"
              data-testid="contact-page-title"
            >
              Get In Touch
            </h1>
            <p
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
              data-testid="contact-page-description"
            >
              Have a question, want to collaborate, or just want to say hello?
              I'd love to hear from you. Fill out the form below and I'll get
              back to you as soon as possible.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="scroll-reveal">
                <Card className="bg-card shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                      Send Me a Message
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Your full name"
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="your.email@example.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="inquiryType"
                          className="text-sm font-medium"
                        >
                          What can I help you with? *
                        </Label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) =>
                            handleInputChange("inquiryType", value)
                          }
                          required
                        >
                          <SelectTrigger className="mt-1" aria-label="Select inquiry type">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="collaboration">
                              Collaboration
                            </SelectItem>
                            <SelectItem value="private-chef">
                              Private Chef Services
                            </SelectItem>
                            <SelectItem value="cooking-classes">
                              Cooking Classes
                            </SelectItem>
                            <SelectItem value="catering">Catering</SelectItem>
                            <SelectItem value="recipe-inquiry">
                              Recipe Inquiry
                            </SelectItem>
                            <SelectItem value="business-inquiry">
                              Business Inquiry
                            </SelectItem>
                            <SelectItem value="media-inquiry">
                              Media Inquiry
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="subject"
                          className="text-sm font-medium"
                        >
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) =>
                            handleInputChange("subject", e.target.value)
                          }
                          placeholder="Brief subject of your message"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="message"
                          className="text-sm font-medium"
                        >
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          placeholder="Tell me more about your inquiry..."
                          required
                          rows={6}
                          className="mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2" aria-hidden="true"></i>
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="scroll-reveal">
                <div className="space-y-8">
                  <Card className="bg-card shadow-lg">
                    <CardContent className="p-8">
                      <h3 className="font-serif text-xl font-bold text-foreground mb-6">
                        Contact Information
                      </h3>

                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-envelope text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              Email
                            </h4>
                            <p className="text-muted-foreground">
                              sureiyah__@example.com
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              I typically respond within 24 hours
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fab fa-whatsapp text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              WhatsApp
                            </h4>
                            <p className="text-muted-foreground">
                              +1 (234) 567-8900
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Quick responses for urgent inquiries
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-clock text-primary"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              Response Time
                            </h4>
                            <p className="text-muted-foreground">
                              Within 24 hours
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Usually much faster for WhatsApp messages
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card className="bg-card shadow-lg">
                    <CardContent className="p-8">
                      <h3 className="font-serif text-xl font-bold text-foreground mb-6">
                        Follow Me
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        {socialLinks.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            aria-label={`Visit our ${link.platform} page`}
                          >
                            <i
                              className={`${getSocialIcon(
                                link.platform
                              )} text-primary text-lg`}
                              aria-hidden="true"
                            ></i>
                            <span className="text-sm font-medium capitalize">
                              {link.platform}
                            </span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
