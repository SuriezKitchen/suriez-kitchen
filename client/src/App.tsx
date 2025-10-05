import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Lazy load pages for code splitting
const Home = lazy(() => import("@/pages/home"));
const Gallery = lazy(() => import("@/pages/gallery"));
const Videos = lazy(() => import("@/pages/videos"));
const Contact = lazy(() => import("@/pages/contact"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const AdminDishes = lazy(() => import("@/pages/admin-dishes"));
const AdminCategories = lazy(() => import("@/pages/admin-categories"));
const AdminVideos = lazy(() => import("@/pages/admin-videos"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/videos" component={Videos} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dishes" component={AdminDishes} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Suspense fallback={<PageLoader />}>
          <Router />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
