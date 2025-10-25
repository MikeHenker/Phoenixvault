import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { data: session, isLoading } = useQuery<{ user: any }>({
    queryKey: ["/api/session"],
  });

  useEffect(() => {
    if (!isLoading) {
      if (!session?.user) {
        setLocation("/auth/login");
      } else if (requireAdmin && !session.user.isAdmin) {
        setLocation("/");
      }
    }
  }, [session, isLoading, requireAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user || (requireAdmin && !session.user.isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
