import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
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
  const filteredItems = menuItems?.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  ) || [];

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
    
    message += `\n*Total: $${getTotalPrice().toFixed(2)}*\n\n`;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item, index) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <OptimizedImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                        width={300}
                        height={200}
                        fallbackSrc={item.imageUrl}
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{item.price}</span>
                        <Button
                          onClick={() => addToOrder(item)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Add to Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
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

            {/* Order Cart */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-serif text-2xl font-bold mb-6">Your Order</h2>
                  
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
                              <p className="text-sm text-muted-foreground">{item.price}</p>
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
                          <span>${getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="space-y-4 mb-6">
                        <h3 className="font-semibold">Delivery Information</h3>
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Your phone number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Delivery address"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Special Notes</Label>
                          <Textarea
                            id="notes"
                            value={customerInfo.notes}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any special instructions"
                            rows={2}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={sendOrderToWhatsApp}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <i className="fab fa-whatsapp mr-2"></i>
                        Order via WhatsApp
                      </Button>
                    </>
                  )}
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
