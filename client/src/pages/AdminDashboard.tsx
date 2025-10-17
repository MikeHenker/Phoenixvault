import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardStats from "@/components/DashboardStats";
import AdminAnalytics from "@/components/AdminAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const { token, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-2xl font-display font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground" data-testid="text-welcome-message">
                  Welcome back, {user?.username || "Admin"}
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={toggleDarkMode} data-testid="button-theme-toggle">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </header>
          
          <main className="flex-1 overflow-auto p-6 space-y-6">
            {stats && (
              <DashboardStats
                totalGames={stats.totalGames}
                totalUsers={stats.totalUsers}
                openTickets={stats.openTickets}
                pendingRequests={stats.pendingRequests}
              />
            )}

            <AdminAnalytics />

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your Phoenix Games platform</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                <Button onClick={() => window.location.href = "/admin/games"} data-testid="button-manage-games">
                  Manage Games
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/admin/support"} data-testid="button-view-tickets">
                  View Support Tickets
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/admin/requests"} data-testid="button-view-requests">
                  View Game Requests
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
