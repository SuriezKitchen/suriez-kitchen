import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import SessionManager from "@/components/session-manager";
import type { MenuItem, InsertMenuItem } from "@shared/schema";

interface MenuForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

export default function AdminMenu() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [isEditingMenuItem, setIsEditingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<MenuForm>({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    isAvailable: true,
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setLocation("/admin/login");
      }
    };
    checkAuth();
  }, [setLocation]);

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["api", "admin", "menu-items"],
    queryFn: async () => {
      const response = await fetch("/api/admin/menu-items", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch menu items");
      return response.json();
    },
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (menuItemData: InsertMenuItem) => {
      const response = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(menuItemData),
      });
      if (!response.ok) throw new Error("Failed to create menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "admin", "menu-items"] });
      resetMenuForm();
      toast({
        title: "Success!",
        description: "Menu item created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async (menuItemData: MenuItem) => {
      const response = await fetch(`/api/admin/menu-items/${menuItemData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(menuItemData),
      });
      if (!response.ok) throw new Error("Failed to update menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "admin", "menu-items"] });
      resetMenuForm();
      toast({
        title: "Success!",
        description: "Menu item updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete menu item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "admin", "menu-items"] });
      toast({
        title: "Success!",
        description: "Menu item deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "",
      isAvailable: true,
    });
    setIsAddMenuItemOpen(false);
    setIsEditingMenuItem(false);
    setEditingMenuItem(null);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operation: "logout" }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLocation("/admin/login");
    }
  };

  const handleBackToDashboard = () => {
    setLocation("/admin");
  };

  // Menu item handlers
  const handleMenuItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingMenuItem && editingMenuItem) {
      updateMenuItemMutation.mutate({
        id: editingMenuItem.id,
        ...menuForm,
        createdAt: editingMenuItem.createdAt,
      });
    } else {
      createMenuItemMutation.mutate(menuForm);
    }
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem);
    setMenuForm({
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      imageUrl: menuItem.imageUrl,
      category: menuItem.category,
      isAvailable: menuItem.isAvailable,
    });
    setIsEditingMenuItem(true);
    setIsAddMenuItemOpen(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  const handleInputChange = (field: keyof MenuForm, value: string | boolean) => {
    setMenuForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading menu items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionManager>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBackToDashboard}
                  className="flex-shrink-0"
                >
                  <i className="fas fa-arrow-left"></i>
                </Button>
                <h1 className="text-lg sm:text-2xl font-bold truncate">
                  Menu Management
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {menuItems?.length || 0} items
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <i className="fas fa-sign-out-alt sm:hidden"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Add Menu Item Button */}
          <div className="mb-8">
            <Button
              onClick={() => {
                setIsEditingMenuItem(false);
                setEditingMenuItem(null);
                setIsAddMenuItemOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add New Menu Item
            </Button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems?.map((menuItem) => (
              <Card key={menuItem.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    className="w-full h-48 object-cover"
                  />
                  {!menuItem.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-xl font-semibold">{menuItem.name}</h3>
                    <span className="text-2xl font-bold text-primary">{menuItem.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{menuItem.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-muted px-2 py-1 rounded-full">
                      {menuItem.category}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMenuItem(menuItem)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMenuItem(menuItem.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {menuItems?.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                <i className="fas fa-utensils text-6xl text-muted-foreground mb-6"></i>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  No Menu Items Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first menu item to showcase your dishes.
                </p>
                <Button
                  onClick={() => {
                    setIsEditingMenuItem(false);
                    setEditingMenuItem(null);
                    setIsAddMenuItemOpen(true);
                  }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Menu Item
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Menu Item Dialog */}
        {(isAddMenuItemOpen || isEditingMenuItem) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {isEditingMenuItem ? "Edit Menu Item" : "Add New Menu Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={menuForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      placeholder="Enter menu item name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={menuForm.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      placeholder="Enter menu item description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        value={menuForm.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                        placeholder="e.g., $12.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={menuForm.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        required
                        placeholder="e.g., Appetizers, Main Course"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={menuForm.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      required
                      placeholder="Enter image URL"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isAvailable"
                      checked={menuForm.isAvailable}
                      onCheckedChange={(checked) => handleInputChange("isAvailable", checked)}
                    />
                    <Label htmlFor="isAvailable">Available for ordering</Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                      className="flex-1"
                    >
                      {isEditingMenuItem 
                        ? (updateMenuItemMutation.isPending ? "Updating..." : "Update Menu Item")
                        : (createMenuItemMutation.isPending ? "Adding..." : "Add Menu Item")
                      }
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetMenuForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SessionManager>
  );
}
