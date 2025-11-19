import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChangePasswordDialog from "@/components/change-password-dialog";
import SessionManager from "@/components/session-manager";

export default function AdminDashboard() {
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
        body: JSON.stringify({ operation: "logout" }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLocation("/admin/login");
    }
  };

  return (
    <SessionManager>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Admin Dashboard
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Account Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your admin account password for better security
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-2xl font-bold text-primary">🔒</div>
                    <div className="text-sm text-muted-foreground">
                      Security
                    </div>
                  </div>
                  <ChangePasswordDialog>
                    <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                      <i className="fas fa-key mr-2"></i>
                      Change Password
                    </Button>
                  </ChangePasswordDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dishes Management */}
          <Card>
            <CardHeader>
              <CardTitle>Dishes Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setLocation("/admin/dishes")}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">View All Dishes</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your dish collection - edit, delete, and organize
                      dishes
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">→</div>
                    <div className="text-sm text-muted-foreground">
                      Manage Dishes
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Management */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Video Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setLocation("/admin/videos")}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Manage Local Videos</h3>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, and delete your custom local videos - showcase your cooking tutorials
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">→</div>
                    <div className="text-sm text-muted-foreground">
                      Manage Videos
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Management */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setLocation("/admin/menu")}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-utensils text-primary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Menu Items
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your restaurant menu - add dishes, set prices, and control availability
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">→</div>
                    <div className="text-sm text-muted-foreground">
                      Manage Menu
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </SessionManager>
  );
}
