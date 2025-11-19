import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Videos from "@/pages/videos";
import Menu from "@/pages/menu";
import Contact from "@/pages/contact";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin";
import AdminDishes from "@/pages/admin-dishes";
import AdminCategories from "@/pages/admin-categories";
import AdminVideos from "@/pages/admin-videos";
import AdminMenu from "@/pages/admin-menu";
import AdminSettings from "@/pages/admin-settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/videos" component={Videos} />
      <Route path="/menu" component={Menu} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dishes" component={AdminDishes} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/menu" component={AdminMenu} />
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
        <Router />
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
