import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Lock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);

  const { data: session } = useQuery<{ user: UserType | null }>({
    queryKey: ["/api/session"],
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      setLocation("/");
    }
  }, [session, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({
        title: "Welcome back!",
        description: data.isAdmin ? "Logged in as admin" : "Successfully logged in",
      });
      setLocation(data.user.isAdmin ? "/admin" : "/library");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminMode) {
      loginMutation.mutate({ username: "admin", password });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            data-testid="text-login-title"
          >
            Welcome Back
          </h1>
          <p className="text-muted-foreground" data-testid="text-login-subtitle">
            Sign in to access your game library
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-signin-title">Sign In</CardTitle>
            <CardDescription data-testid="text-signin-description">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant={!isAdminMode ? "default" : "outline"}
                onClick={() => setIsAdminMode(false)}
                className="flex-1"
              >
                User Login
              </Button>
              <Button
                type="button"
                variant={isAdminMode ? "default" : "outline"}
                onClick={() => setIsAdminMode(true)}
                className="flex-1"
              >
                Admin Login
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAdminMode && (
                <div className="space-y-2">
                  <Label htmlFor="username" data-testid="label-username">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-username"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" data-testid="label-password">
                  {isAdminMode ? "Admin Password" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={isAdminMode ? "Enter admin password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Signing in..." : isAdminMode ? "Sign In as Admin" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground" data-testid="text-register-prompt">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setLocation("/auth/register")}
                  data-testid="button-register-link"
                >
                  Register here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
