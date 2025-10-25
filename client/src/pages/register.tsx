import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Lock, User, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  const { data: session } = useQuery<{ user: UserType | null }>({
    queryKey: ["/api/session"],
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      setLocation("/");
    }
  }, [session, setLocation]);

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; licenseKey: string }) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Your account is pending admin approval. You'll be able to log in once approved.",
      });
      setLocation("/auth/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username, password, licenseKey });
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
            data-testid="text-register-title"
          >
            Join GameVault
          </h1>
          <p className="text-muted-foreground" data-testid="text-register-subtitle">
            Create your account with a valid beta license key
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-create-account-title">Create Account</CardTitle>
            <CardDescription data-testid="text-create-account-description">
              You need a valid license key to join the beta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" data-testid="label-register-username">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-register-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" data-testid="label-register-password">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-register-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseKey" data-testid="label-license-key">
                  License Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="licenseKey"
                    type="text"
                    placeholder="Enter your beta license key"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="pl-10 font-mono"
                    required
                    data-testid="input-license-key"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground" data-testid="text-login-prompt">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setLocation("/auth/login")}
                  data-testid="button-login-link"
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
