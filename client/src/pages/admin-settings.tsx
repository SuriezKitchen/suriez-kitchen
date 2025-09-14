import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// import SimpleSessionManager from "@/components/simple-session-manager";
import type { Setting } from "@shared/schema";

interface SettingsForm {
  youtubeApiKey: string;
  youtubeChannelId: string;
}

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<SettingsForm>({
    youtubeApiKey: "",
    youtubeChannelId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["api", "settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  // Update settings when loaded
  useEffect(() => {
    if (settings) {
      const youtubeApiKey =
        settings.find((s) => s.key === "youtube_api_key")?.value || "";
      const youtubeChannelId =
        settings.find((s) => s.key === "youtube_channel_id")?.value || "";

      setFormData({
        youtubeApiKey,
        youtubeChannelId,
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof SettingsForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update YouTube API Key
      await fetch("/api/settings/youtube_api_key", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({
          value: formData.youtubeApiKey,
          description:
            "YouTube Data API v3 Key for fetching channel data and videos",
        }),
      });

      // Update YouTube Channel ID
      await fetch("/api/settings/youtube_channel_id", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({
          value: formData.youtubeChannelId,
          description:
            "YouTube Channel ID for fetching channel data and videos",
        }),
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["api", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["api", "youtube"] });

      toast({
        title: "Settings Updated!",
        description: "Your YouTube settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch("/api/youtube/channel", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Connection Successful!",
          description: `Found channel with ${data.subscriberCount} subscribers and ${data.videoCount} videos.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to YouTube API",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to test YouTube API connection",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleBackToDashboard}>
                  ← Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">YouTube Settings</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  API Configuration
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToDashboard}>
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">YouTube Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                API Configuration
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Manage your YouTube API configuration for automatic data fetching.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="youtubeApiKey"
                    className="text-sm font-medium"
                  >
                    YouTube API Key
                  </Label>
                  <Input
                    id="youtubeApiKey"
                    type="password"
                    value={formData.youtubeApiKey}
                    onChange={(e) =>
                      handleInputChange("youtubeApiKey", e.target.value)
                    }
                    placeholder="AIzaSy..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your YouTube Data API v3 key. Get it from the Google Cloud
                    Console.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="youtubeChannelId"
                    className="text-sm font-medium"
                  >
                    YouTube Channel ID
                  </Label>
                  <Input
                    id="youtubeChannelId"
                    type="text"
                    value={formData.youtubeChannelId}
                    onChange={(e) =>
                      handleInputChange("youtubeChannelId", e.target.value)
                    }
                    placeholder="UCsWnEV_XEevwZvSCpOLDkNw"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your YouTube channel ID (starts with UC...). Find it in your
                    channel URL.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Saving..." : "Save Settings"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={
                      !formData.youtubeApiKey || !formData.youtubeChannelId
                    }
                  >
                    Test Connection
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Key</span>
                  <span
                    className={`text-sm ${
                      formData.youtubeApiKey ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formData.youtubeApiKey ? "✓ Configured" : "✗ Not Set"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Channel ID</span>
                  <span
                    className={`text-sm ${
                      formData.youtubeChannelId
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formData.youtubeChannelId ? "✓ Configured" : "✗ Not Set"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
