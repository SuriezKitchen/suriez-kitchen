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
      console.log("Creating dish with data:", dishData);
      const response = await fetch("/api/admin/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dishData),
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create dish:", errorText);
        throw new Error("Failed to create dish");
      }
      const result = await response.json();
      console.log("Dish created successfully:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Dish creation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["api", "dishes"] });
      resetDishForm();
    },
    onError: (error) => {
      console.error("Dish creation failed:", error);
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
      resetDishForm();
    },
  });


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

  const resetDishForm = () => {
    setDishForm({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
    });
    setIsAddDishOpen(false);
    setIsEditing(false);
    setEditingDish(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", dishForm, "isEditing:", isEditing, "editingDish:", editingDish);
    if (isEditing && editingDish) {
      console.log("Updating dish");
      updateDishMutation.mutate(dishForm);
    } else {
      console.log("Creating dish");
      createDishMutation.mutate(dishForm);
    }
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
                  Dishes Management
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {dishes?.length || 0} dishes
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
          {/* Add Dish Button */}
          <div className="mb-8">
            <Button
              onClick={() => {
                console.log("Add New Dish button clicked");
                setDishForm({
                  title: "",
                  description: "",
                  imageUrl: "",
                  category: "",
                });
                setIsEditing(false);
                setEditingDish(null);
                setIsAddDishOpen(true);
                console.log("Set isAddDishOpen to true");
              }}
              className="flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add New Dish
            </Button>
          </div>

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

          {/* Add/Edit Dialog */}
          <Dialog open={isAddDishOpen || isEditing} onOpenChange={(open) => {
            console.log("Dialog onOpenChange:", open, "isAddDishOpen:", isAddDishOpen, "isEditing:", isEditing);
            if (!open) {
              resetDishForm();
            }
          }}>
            <DialogContent className="rounded-lg w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Dish" : "Add New Dish"}</DialogTitle>
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
                      setDishForm({
                        ...dishForm,
                        description: e.target.value,
                      })
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
                    onClick={resetDishForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDishMutation.isPending || updateDishMutation.isPending}>
                    {isEditing 
                      ? (updateDishMutation.isPending ? "Updating..." : "Update Dish")
                      : (createDishMutation.isPending ? "Adding..." : "Add Dish")
                    }
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
