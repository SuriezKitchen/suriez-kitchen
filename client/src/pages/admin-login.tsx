import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        // Session is now stored in cookies, no need for localStorage
        setLocation("/admin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        {/* Carrot video - Primary source */}
        <source
          src="https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/61678-500316021_tiny.mp4"
          type="video/mp4"
        />
        {/* Fallback message */}
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="hero-overlay absolute inset-0"></div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground">
              Enter your credentials to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  required
                  placeholder="Enter username"
                  className="bg-white/80 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                  placeholder="Enter password"
                  className="bg-white/80 border-gray-300"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
