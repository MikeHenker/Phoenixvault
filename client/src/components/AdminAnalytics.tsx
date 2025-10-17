import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AdminAnalytics() {
  const { token } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-downloads">
              {stats.totalDownloads || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.downloadsThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-rating">
              {stats.averageRating ? (stats.averageRating / 20).toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews || 0} total reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-users">
              {stats.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-top-category">
              {stats.topCategory || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Most downloaded
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Downloaded Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topGames?.slice(0, 5).map((game: any, index: number) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                data-testid={`top-game-${index}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{game.title}</p>
                    <p className="text-sm text-muted-foreground">{game.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{game.downloads || 0}</p>
                  <p className="text-xs text-muted-foreground">downloads</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
