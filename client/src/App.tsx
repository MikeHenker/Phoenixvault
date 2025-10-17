import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { PasswordGate } from "@/components/PasswordGate";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserProfile from "@/pages/UserProfile";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminGames from "@/pages/AdminGames";
import AdminSupport from "@/pages/AdminSupport";
import AdminRequests from "@/pages/AdminRequests";
import AdminSettings from "@/pages/AdminSettings";
import AdminUsers from "@/pages/AdminUsers";
import GameDetails from "@/pages/GameDetails";
import AdultZone from "@/pages/AdultZone";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/game/:id" component={GameDetails} />
      <Route path="/adult-zone" component={AdultZone} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/games" component={AdminGames} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/support" component={AdminSupport} />
      <Route path="/admin/requests" component={AdminRequests} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PasswordGate>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </PasswordGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
