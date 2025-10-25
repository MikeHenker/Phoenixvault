
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const [, setLocation] = useLocation();
  const { data: session, isLoading } = useQuery<{ user: User | null }>({
    queryKey: ["/api/session"],
  });

  useEffect(() => {
    if (!isLoading && !session?.user) {
      setLocation("/auth/register");
    } else if (!isLoading && requireAdmin && !session?.user?.isAdmin) {
      setLocation("/");
    }
  }, [session, isLoading, setLocation, requireAdmin]);

  if (isLoading) {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  // Redirect non-admin users trying to access admin routes
  if (requireAdmin && !session.user.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
