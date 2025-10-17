import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate password reset email
    setTimeout(() => {
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists with ${email}, you'll receive a password reset link.`,
      });
      setEmail("");
      setOpen(false);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-primary" data-testid="link-forgot-password">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-reset-email"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-send-reset">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
