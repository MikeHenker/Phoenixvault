import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, MessageSquare, Mail } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalGames: number;
  totalUsers: number;
  openTickets: number;
  pendingRequests: number;
}

export default function DashboardStats({
  totalGames,
  totalUsers,
  openTickets,
  pendingRequests,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Games"
        value={totalGames}
        icon={<Gamepad2 className="h-4 w-4" />}
        description="Games in library"
      />
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={<Users className="h-4 w-4" />}
        description="Registered users"
      />
      <StatCard
        title="Open Tickets"
        value={openTickets}
        icon={<MessageSquare className="h-4 w-4" />}
        description="Need attention"
      />
      <StatCard
        title="Game Requests"
        value={pendingRequests}
        icon={<Mail className="h-4 w-4" />}
        description="Pending approval"
      />
    </div>
  );
}
