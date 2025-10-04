import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SessionManager from "@/components/session-manager";
import AdminVideoCard from "@/components/admin-video-card";

interface LocalVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: string;
  likes: string;
  createdAt: string;
}

interface VideoForm {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: string;
  likes: string;
}

export default function AdminVideos() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<LocalVideo | null>(null);
  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    duration: "",
    views: "0",
    likes: "0",
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

  // Fetch local videos
  const { data: videos, isLoading } = useQuery<LocalVideo[]>({
    queryKey: ["api", "local-videos"],
    queryFn: async () => {
      const response = await fetch("/api/local-videos", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (videoData: VideoForm) => {
      const response = await fetch("/api/admin/local-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(videoData),
      });
      if (!response.ok) throw new Error("Failed to create video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "local-videos"] });
      resetVideoForm();
      toast({
        title: "Success!",
        description: "Video created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create video. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async (videoData: LocalVideo) => {
      const response = await fetch(`/api/admin/local-videos/${videoData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(videoData),
      });
      if (!response.ok) throw new Error("Failed to update video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "local-videos"] });
      resetVideoForm();
      toast({
        title: "Success!",
        description: "Video updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/local-videos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "local-videos"] });
      toast({
        title: "Success!",
        description: "Video deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetVideoForm = () => {
    setVideoForm({
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
      duration: "",
      views: "0",
      likes: "0",
    });
    setIsAddVideoOpen(false);
    setIsEditingVideo(false);
    setEditingVideo(null);
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

  // Video handlers
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingVideo && editingVideo) {
      updateVideoMutation.mutate({
        id: editingVideo.id,
        ...videoForm,
        createdAt: editingVideo.createdAt,
      });
    } else {
      createVideoMutation.mutate(videoForm);
    }
  };

  const handleEditVideo = (video: LocalVideo) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      duration: video.duration,
      views: video.views,
      likes: video.likes,
    });
    setIsEditingVideo(true);
    setIsAddVideoOpen(true);
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      deleteVideoMutation.mutate(id);
    }
  };

  const handleInputChange = (field: keyof VideoForm, value: string) => {
    setVideoForm((prev) => ({
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
            <p className="mt-4 text-muted-foreground">Loading videos...</p>
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
                  Video Management
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {videos?.length || 0} videos
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
          {/* Add Video Button */}
          <div className="mb-8">
            <Button
              onClick={() => {
                setIsEditingVideo(false);
                setEditingVideo(null);
                setIsAddVideoOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add New Video
            </Button>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {videos?.map((video) => (
              <AdminVideoCard
                key={video.id}
                video={video}
                onEdit={handleEditVideo}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>

          {/* Empty State */}
          {videos?.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-card rounded-xl p-12 max-w-md mx-auto">
                <i className="fas fa-video text-6xl text-muted-foreground mb-6"></i>
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  No Videos Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first local video to showcase your
                  content.
                </p>
                <Button
                  onClick={() => {
                    setIsEditingVideo(false);
                    setEditingVideo(null);
                    setIsAddVideoOpen(true);
                  }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Video
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Video Dialog */}
        {(isAddVideoOpen || isEditingVideo) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {isEditingVideo ? "Edit Video" : "Add New Video"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVideoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={videoForm.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      placeholder="Enter video title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={videoForm.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      placeholder="Enter video description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="thumbnailUrl"
                      value={videoForm.thumbnailUrl}
                      onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                      required
                      placeholder="Enter thumbnail image URL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={videoForm.videoUrl}
                      onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                      required
                      placeholder="Enter video file URL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={videoForm.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      required
                      placeholder="e.g., 8:45"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="views">Views</Label>
                      <Input
                        id="views"
                        value={videoForm.views}
                        onChange={(e) => handleInputChange("views", e.target.value)}
                        required
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="likes">Likes</Label>
                      <Input
                        id="likes"
                        value={videoForm.likes}
                        onChange={(e) => handleInputChange("likes", e.target.value)}
                        required
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                      className="flex-1"
                    >
                      {isEditingVideo 
                        ? (updateVideoMutation.isPending ? "Updating..." : "Update Video")
                        : (createVideoMutation.isPending ? "Adding..." : "Add Video")
                      }
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetVideoForm}
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
