import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Gamepad2, Key, Users, LogOut, Home } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({ title: "Logged out successfully" });
      setLocation("/");
    },
  });

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, testId: "link-admin-dashboard" },
    { href: "/admin/games", label: "Games", icon: Gamepad2, testId: "link-admin-games" },
    { href: "/admin/licenses", label: "Licenses", icon: Key, testId: "link-admin-licenses" },
    { href: "/admin/users", label: "Users", icon: Users, testId: "link-admin-users" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r bg-sidebar">
          <div className="sticky top-0">
            <div className="p-6">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg p-2 -m-2" data-testid="link-admin-logo">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p
                      className="text-lg font-bold"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      GameVault
                    </p>
                    <p className="text-xs text-muted-foreground">Admin Panel</p>
                  </div>
                </div>
              </Link>
            </div>

            <Separator />

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${isActive ? "bg-sidebar-accent" : ""}`}
                      data-testid={item.testId}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <Separator className="my-4" />

            <div className="p-4 space-y-1">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start" data-testid="link-back-to-site">
                  <Home className="w-4 h-4 mr-3" />
                  Back to Site
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-admin-logout"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
