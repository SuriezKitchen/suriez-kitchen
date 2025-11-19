import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SessionManager from "@/components/session-manager";
import type { Category } from "@shared/schema";

export default function AdminCategories() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Category state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
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

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["api", "categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<Category, "id" | "createdAt">) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "categories"] });
      resetCategoryForm();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: Category) => {
      const response = await fetch(`/api/admin/categories/${categoryData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to update category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "categories"] });
      setIsEditingCategory(false);
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "categories"] });
    },
  });

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      color: "#3B82F6",
    });
    setIsAddCategoryOpen(false);
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

  // Category handlers
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingCategory && editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        ...categoryForm,
        createdAt: editingCategory.createdAt,
        isActive: editingCategory.isActive,
      });
    } else {
      createCategoryMutation.mutate({
        ...categoryForm,
        isActive: true,
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "",
    });
    setIsEditingCategory(true);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

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
                  Categories Management
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {categories?.length || 0} categories
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
          {/* Add New Category */}
          <Collapsible
            open={isAddCategoryOpen}
            onOpenChange={setIsAddCategoryOpen}
          >
            <Card className="mb-8">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    Add New Category
                    <span className="text-sm text-muted-foreground">
                      {isAddCategoryOpen ? "▼" : "▶"}
                    </span>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={categoryForm.name}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              name: e.target.value,
                            })
                          }
                          required
                          placeholder="e.g., breakfast"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="color"
                            type="color"
                            value={categoryForm.color}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                color: e.target.value,
                              })
                            }
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            value={categoryForm.color}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                color: e.target.value,
                              })
                            }
                            placeholder="#3B82F6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of this category"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createCategoryMutation.isPending}
                      >
                        {createCategoryMutation.isPending
                          ? "Adding..."
                          : "Add Category"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoriesLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <Skeleton className="h-4 w-4 rounded" />
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
                  : categories?.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: category.color || "#000000",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
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
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {category.name}
                                  "? This action cannot be undone and will
                                  affect all dishes in this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
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
            </CardContent>
          </Card>

          {/* Edit Category Modal */}
          <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
            <DialogContent className="rounded-lg w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g., breakfast"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-color"
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          color: e.target.value,
                        })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={categoryForm.color}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          color: e.target.value,
                        })
                      }
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of this category"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingCategory(false);
                      setEditingCategory(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCategoryMutation.isPending}
                  >
                    {updateCategoryMutation.isPending
                      ? "Updating..."
                      : "Update Category"}
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
