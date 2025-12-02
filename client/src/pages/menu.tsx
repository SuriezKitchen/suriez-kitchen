import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import OptimizedImage from "@/components/optimized-image";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  dayOfWeek?: string | null; // Monday, Tuesday, etc. or null for regular items
  isAvailable: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

export default function Menu() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["api", "menu-items"],
    queryFn: async () => {
      const response = await fetch("/api/menu-items");
      if (!response.ok) throw new Error("Failed to fetch menu items");
      return response.json();
    },
  });

  // Get unique categories
  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : [];
  
  // Group items by day of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const itemsByDay = menuItems?.reduce((acc, item) => {
    // Handle null, undefined, or empty string dayOfWeek
    let day = 'Regular';
    if (item.dayOfWeek) {
      const dayStr = String(item.dayOfWeek).trim();
      if (dayStr !== '' && daysOfWeek.includes(dayStr)) {
        day = dayStr;
      }
    }
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};
  
  // Filter items by category if needed
  const filteredItemsByDay = Object.entries(itemsByDay).reduce((acc, [day, items]) => {
    const filtered = items.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
    );
    if (filtered.length > 0) acc[day] = filtered;
    return acc;
  }, {} as Record<string, MenuItem[]>);

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

  const addToOrder = (item: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(orderItem => orderItem.id === item.id);
      if (existing) {
        return prev.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      }
    });
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => {
      const existing = prev.find(orderItem => orderItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(orderItem =>
          orderItem.id === itemId
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem
        );
      } else {
        return prev.filter(orderItem => orderItem.id !== itemId);
      }
    });
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const sendOrderToWhatsApp = () => {
    if (orderItems.length === 0) {
      alert("Please add items to your order");
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert("Please fill in your name and phone number");
      return;
    }

    let message = `*New Order from Suriez Kitchen Website*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${customerInfo.name}\n`;
    message += `Phone: ${customerInfo.phone}\n`;
    message += `Address: ${customerInfo.address || 'Not provided'}\n`;
    if (customerInfo.notes) {
      message += `Notes: ${customerInfo.notes}\n`;
    }
    message += `\n*Order Items:*\n`;
    
    orderItems.forEach(item => {
      message += `- ${item.name} x${item.quantity} - ${item.price}\n`;
    });
    
    message += `\n*Total: ${getTotalPrice().toFixed(2)} TZS*\n\n`;
    message += `Please confirm this order and provide delivery details.`;

    const whatsappUrl = `https://wa.me/255789779995?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Skeleton className="h-16 w-96 mx-auto mb-6" />
              <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-[400px] flex flex-col">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="px-4 pt-4 pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2 flex-1" />
                    <Skeleton className="h-4 w-2/3 mt-auto" />
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

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Render cart content (reusable for both desktop and mobile)
  const renderCartContent = (isMobile = false) => (
    <>
      {orderItems.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Your cart is empty. Add some delicious items!
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <span className="inline-block text-sm text-white bg-green-600 px-2 py-1 rounded mt-1">{item.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromOrder(item.id)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addToOrder({ id: item.id, name: item.name, price: item.price, description: '', imageUrl: '', category: '', isAvailable: true } as MenuItem)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{getTotalPrice().toFixed(2)} TZS</span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold">Delivery Information</h3>
            <div>
              <Label htmlFor={isMobile ? "name-mobile" : "name"}>Name *</Label>
              <Input
                id={isMobile ? "name-mobile" : "name"}
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor={isMobile ? "phone-mobile" : "phone"}>Phone *</Label>
              <Input
                id={isMobile ? "phone-mobile" : "phone"}
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Your phone number"
              />
            </div>
            <div>
              <Label htmlFor={isMobile ? "address-mobile" : "address"}>Address</Label>
              <Textarea
                id={isMobile ? "address-mobile" : "address"}
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Delivery address"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor={isMobile ? "notes-mobile" : "notes"}>Special Notes</Label>
              <Textarea
                id={isMobile ? "notes-mobile" : "notes"}
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions"
                rows={2}
              />
            </div>
          </div>

          <Button
            onClick={() => {
              sendOrderToWhatsApp();
              if (isMobile) setIsCartOpen(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Order via WhatsApp
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Floating Cart Button for Mobile */}
      <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DrawerTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 lg:hidden bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl hover:bg-primary/90 transition-all duration-300 hover:scale-110"
            aria-label="Open cart"
          >
            <i className="fas fa-shopping-cart text-xl relative">
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 grid place-items-center" style={{ lineHeight: '1' }}>
                  {totalItems}
                </span>
              )}
            </i>
          </button>
        </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-2xl font-bold">Your Order</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              {renderCartContent(true)}
            </div>
          </DrawerContent>
      </Drawer>

      <main className="pt-24 pb-20" ref={sectionRef}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 mt-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Menu
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover our delicious dishes crafted with love and passion. 
              Place your order and we'll deliver it fresh to your door.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Items
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              {/* Daily Specials Accordion */}
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Daily Specials
                </h2>
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full space-y-2"
                  value={expandedDay || undefined}
                  onValueChange={(value) => setExpandedDay(value || null)}
                >
                  {daysOfWeek.map((day) => {
                    const dayItems = filteredItemsByDay[day] || [];
                    
                    return (
                      <AccordionItem 
                        key={day} 
                        value={day} 
                        className="border border-border/50 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                      >
                        <AccordionTrigger className="text-left hover:no-underline px-6 py-4">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <i className="fas fa-calendar-day text-primary"></i>
                              </div>
                              <div>
                                <h3 className="font-serif text-2xl font-bold text-foreground">
                                  {day}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium mt-0.5">
                                  Specials
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                dayItems.length > 0 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {dayItems.length > 0 
                                  ? `${dayItems.length} ${dayItems.length === 1 ? 'item' : 'items'}`
                                  : 'No items'
                                }
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          {dayItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              {dayItems.map((item, index) => (
                                <Card 
                                  key={item.id} 
                                  className="group overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                                >
                                  <div className="relative overflow-hidden">
                      <OptimizedImage
                        src={item.imageUrl}
                        alt={item.name}
                                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        width={300}
                                      height={224}
                        fallbackSrc={item.imageUrl}
                      />
                                    <div className="absolute top-4 right-4 z-20">
                                      <div className="bg-green-600 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                        {item.price}
                                      </div>
                                    </div>
                    </div>
                    <CardContent className="p-6">
                                    <h3 className="font-serif text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                                      {item.name}
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed line-clamp-2">
                                      {item.description}
                                    </p>
                        <Button
                          onClick={() => addToOrder(item)}
                                      className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                      size="lg"
                        >
                                      <i className="fas fa-shopping-cart mr-2"></i>
                          Add to Order
                        </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                <i className="fas fa-utensils text-3xl text-muted-foreground/50"></i>
                              </div>
                              <p className="text-muted-foreground font-medium">
                                No specials available for {day}. Check back later!
                              </p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                  
                  {/* Regular Menu Item */}
                  {filteredItemsByDay['Regular']?.length > 0 && (
                    <AccordionItem 
                      value="Regular" 
                      className="border border-border/50 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                    >
                      <AccordionTrigger className="text-left hover:no-underline px-6 py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <i className="fas fa-utensils text-primary"></i>
                            </div>
                            <div>
                              <h3 className="font-serif text-2xl font-bold text-foreground">
                                Regular
                              </h3>
                              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                                Menu
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                            {filteredItemsByDay['Regular'].length} {filteredItemsByDay['Regular'].length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          {filteredItemsByDay['Regular'].map((item, index) => (
                            <Card 
                              key={item.id} 
                              className="group overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                            >
                              <div className="relative overflow-hidden">
                                <OptimizedImage
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                                  width={300}
                                  height={224}
                                  fallbackSrc={item.imageUrl}
                                />
                                <div className="absolute top-4 right-4 z-20">
                                  <div className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    {item.price}
                                  </div>
                                </div>
                      </div>
                              <CardContent className="p-6">
                                <h3 className="font-serif text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                                <p className="text-muted-foreground mb-6 text-sm leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>
                                <Button
                                  onClick={() => addToOrder(item)}
                                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                  size="lg"
                                >
                                  <i className="fas fa-shopping-cart mr-2"></i>
                                  Add to Order
                                </Button>
                    </CardContent>
                  </Card>
                ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>

              {/* Empty State */}
              {(!menuItems || menuItems.length === 0) && !isLoading && (
                <div className="text-center py-20">
                  <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                    <i className="fas fa-utensils text-6xl text-muted-foreground mb-6"></i>
                    <h3 className="font-serif text-2xl font-semibold mb-4">
                      No Items Found
                    </h3>
                    <p className="text-muted-foreground">
                      No menu items are available at the moment.
                    </p>
                  </div>
                </div>
              )}
              
              {menuItems && menuItems.length > 0 && Object.keys(filteredItemsByDay).length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                    <i className="fas fa-utensils text-6xl text-muted-foreground mb-6"></i>
                    <h3 className="font-serif text-2xl font-semibold mb-4">
                      No Items Found
                    </h3>
                    <p className="text-muted-foreground">
                      No menu items are available in this category.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Cart - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-serif text-2xl font-bold mb-6">Your Order</h2>
                  {renderCartContent(false)}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
