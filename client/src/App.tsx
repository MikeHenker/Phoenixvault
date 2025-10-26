import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import AdminLayout from "@/components/layout/admin-layout";
import ProtectedRoute from "@/components/protected-route";

import Home from "@/pages/home";
import Library from "@/pages/library";
import GameDetail from "@/pages/game-detail";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminGames from "@/pages/admin/games";
import AdminLicenses from "@/pages/admin/licenses";
import AdminUsers from "@/pages/admin/users";
import Launcher from "@/pages/launcher";

function Router() {
  const [location] = useLocation();
  const isAuthRoute = location.startsWith("/auth");
  const isAdminRoute = location.startsWith("/admin");
  const isLauncherRoute = location === "/" && window.electronAPI;

  return (
    <>
      {!isAuthRoute && !isAdminRoute && !isLauncherRoute && <Navbar />}
      <Switch>
        {/* Desktop Launcher - Only shown in Electron */}
        <Route path="/">
          {window.electronAPI ? <Launcher /> : <Home />}
        </Route>
        
        {/* Authentication Routes */}
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />

        {/* Protected Routes */}
        <Route path="/library">
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        </Route>
        <Route path="/game/:id">
          <ProtectedRoute>
            <GameDetail />
          </ProtectedRoute>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/admin/games">
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminGames />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/admin/licenses">
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminLicenses />
            </AdminLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
