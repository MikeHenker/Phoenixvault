import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { User } from "@shared/schema";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: session, isLoading } = useQuery<{ user: User | null }>({
    queryKey: ["/api/session"],
  });

  useEffect(() => {
    if (!isLoading && !session?.user) {
      setLocation("/auth/register");
    }
  }, [session, isLoading, setLocation]);

  if (isLoading) {
    return null;
  }

  // Redirect unauthenticated users to registration
  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}