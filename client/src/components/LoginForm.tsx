import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { LogIn } from "lucide-react";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

interface LoginFormProps {
  onSubmit?: (username: string, password: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(username, password);
    console.log("Login submitted:", { username, password: "***" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access Phoenix Games
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="input-username"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <ForgotPasswordDialog />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-submit">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
              Register here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
