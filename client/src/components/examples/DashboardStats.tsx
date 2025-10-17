import DashboardStats from "../DashboardStats";

export default function DashboardStatsExample() {
  return (
    <div className="p-8">
      <DashboardStats
        totalGames={156}
        totalUsers={2847}
        openTickets={12}
        pendingRequests={8}
      />
    </div>
  );
}
