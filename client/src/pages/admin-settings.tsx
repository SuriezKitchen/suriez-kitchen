import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SessionManager from "@/components/session-manager";

export default function AdminSettings() {
  const [, setLocation] = useLocation();

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
                  Settings
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <i className="fas fa-cog text-6xl text-muted-foreground mb-6"></i>
                  <h3 className="font-serif text-2xl font-semibold mb-4">
                    Settings Coming Soon
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Additional project settings will be available here in future updates.
                  </p>
                  <Button onClick={handleBackToDashboard}>
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SessionManager>
  );
}