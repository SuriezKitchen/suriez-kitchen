import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import SessionManager from "@/components/session-manager";
import type { Dish, Category } from "@shared/schema";

export default function AdminDishes() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [dishForm, setDishForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/me", {
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

  // Fetch dishes
  const {
    data: dishes,
    isLoading,
    error,
  } = useQuery<Dish[]>({
    queryKey: ["api", "dishes"],
    queryFn: async () => {
      const response = await fetch("/api/dishes");
      if (!response.ok) throw new Error("Failed to fetch dishes");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["api", "categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Delete dish mutation
  const deleteDishMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/dishes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete dish");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "dishes"] });
    },
  });

  // Create dish mutation
  const createDishMutation = useMutation({
    mutationFn: async (dishData: Omit<Dish, "id" | "createdAt">) => {
      const response = await fetch("/api/admin/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dishData),
      });
      if (!response.ok) throw new Error("Failed to create dish");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "dishes"] });
      resetForm();
    },
  });

  // Update dish mutation
  const updateDishMutation = useMutation({
    mutationFn: async (dishData: Omit<Dish, "id" | "createdAt">) => {
      const response = await fetch(`/api/admin/dishes/${editingDish?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dishData),
      });
      if (!response.ok) throw new Error("Failed to update dish");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "dishes"] });
      setIsEditing(false);
      setEditingDish(null);
    },
  });

  const resetForm = () => {
    setDishForm({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
    });
    setIsAddDishOpen(false);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      title: dish.title,
      description: dish.description,
      imageUrl: dish.imageUrl,
      category: dish.category,
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingDish) {
      updateDishMutation.mutate(dishForm);
    } else {
      createDishMutation.mutate(dishForm);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
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

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Error Loading Dishes
            </h1>
            <p className="text-muted-foreground">
              Please try refreshing the page.
            </p>
            <Button onClick={handleBackToDashboard} className="mt-4">
              Back to Dashboard
            </Button>
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
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleBackToDashboard}>
                  ← Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">Dishes Management</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {dishes?.length || 0} dishes
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Add New Dish */}
          <Collapsible open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
            <Card className="mb-8">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    Add New Dish
                    <span className="text-sm text-gray-500">
                      {isAddDishOpen ? "▼" : "▶"}
                    </span>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={dishForm.title}
                        onChange={(e) =>
                          setDishForm({ ...dishForm, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={dishForm.category}
                        onValueChange={(value) =>
                          setDishForm({ ...dishForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem
                              key={category.name}
                              value={category.name}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={dishForm.description}
                        onChange={(e) =>
                          setDishForm({
                            ...dishForm,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={dishForm.imageUrl}
                        onChange={(e) =>
                          setDishForm({ ...dishForm, imageUrl: e.target.value })
                        }
                        required
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button
                        type="submit"
                        disabled={createDishMutation.isPending}
                      >
                        {createDishMutation.isPending
                          ? "Adding..."
                          : "Add Dish"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Dishes List */}
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))
              : dishes?.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={dish.imageUrl}
                        alt={dish.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {dish.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {dish.description}
                      </p>
                      <span className="inline-block text-xs bg-secondary px-2 py-1 rounded">
                        {dish.category}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(dish)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Dish</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{dish.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDishMutation.mutate(dish.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Dish</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={dishForm.title}
                      onChange={(e) =>
                        setDishForm({ ...dishForm, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={dishForm.category}
                      onValueChange={(value) =>
                        setDishForm({ ...dishForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={dishForm.description}
                    onChange={(e) =>
                      setDishForm({ ...dishForm, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUrl">Image URL</Label>
                  <Input
                    id="edit-imageUrl"
                    value={dishForm.imageUrl}
                    onChange={(e) =>
                      setDishForm({ ...dishForm, imageUrl: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDishMutation.isPending}>
                    {updateDishMutation.isPending
                      ? "Updating..."
                      : "Update Dish"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SessionManager>
  );
}
