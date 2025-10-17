import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export default function AdminSettings() {
  const { user } = useAuth();

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
              <h1 className="text-2xl font-display font-bold">Settings</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your admin account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={user?.username || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || ""} disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure Phoenix Games platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Phoenix Games" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" defaultValue="Ignite Your Gaming Experience" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
