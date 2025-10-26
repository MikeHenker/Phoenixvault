import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Key, Gamepad2, Download } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery<{
    totalUsers: number;
    totalLicenses: number;
    activeLicenses: number;
    totalGames: number;
    totalDownloads: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-primary",
      testId: "stat-total-users",
    },
    {
      title: "Active Licenses",
      value: `${stats?.activeLicenses || 0}/${stats?.totalLicenses || 0}`,
      icon: Key,
      color: "text-accent",
      testId: "stat-active-licenses",
    },
    {
      title: "Total Games",
      value: stats?.totalGames || 0,
      icon: Gamepad2,
      color: "text-chart-3",
      testId: "stat-total-games",
    },
    {
      title: "Total Downloads",
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: "text-chart-4",
      testId: "stat-total-downloads",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Montserrat, sans-serif" }}
          data-testid="text-admin-dashboard-title"
        >
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-admin-dashboard-subtitle">
          Overview of Phoenix Games platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" data-testid={`${stat.testId}-title`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid={`${stat.testId}-value`}
              >
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-quick-actions-title">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-quick-actions-description">
            Use the sidebar to navigate to different admin sections for managing games, licenses, and users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
