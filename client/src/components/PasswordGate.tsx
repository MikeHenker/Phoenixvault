import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Flame } from "lucide-react";

const CORRECT_PASSWORD = "cot#8hu1UDrA";
const STORAGE_KEY = "phoenix_access_granted";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const accessGranted = sessionStorage.getItem(STORAGE_KEY);
    if (accessGranted === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to Phoenix Games!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Flame className="w-16 h-16 text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Flame className="w-20 h-20 text-primary animate-pulse" />
              <Lock className="w-8 h-8 text-primary absolute bottom-0 right-0" />
            </div>
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Phoenix Games
              </CardTitle>
              <CardDescription className="text-center">
                Enter the access password to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-center text-lg"
                    autoFocus
                    data-testid="input-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  data-testid="button-submit-password"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Access Platform
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Protected access - authorized users only
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
