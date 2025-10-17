import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { UserPlus } from "lucide-react";

interface RegisterFormProps {
  onSubmit?: (username: string, email: string, password: string) => void;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords don't match");
      return;
    }
    onSubmit?.(username, email, password);
    console.log("Register submitted:", { username, email });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-display">Create Account</CardTitle>
        <CardDescription>
          Join Phoenix Games and start your gaming journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="input-username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="input-confirm-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-submit">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              Login here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
