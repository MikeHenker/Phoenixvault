import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

export default function AdminUsers() {
  const { token } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold">Users</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : (
              <div className="space-y-4">
                {users.map((user: any) => (
                  <Card key={user.id} data-testid={`card-user-${user.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg" data-testid={`text-username-${user.id}`}>
                            {user.username}
                          </h3>
                          <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                            {user.email}
                          </p>
                        </div>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} data-testid={`badge-role-${user.id}`}>
                          {user.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
