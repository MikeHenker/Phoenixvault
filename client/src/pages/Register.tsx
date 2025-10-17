import RegisterForm from "@/components/RegisterForm";
import phoenixLogo from "@assets/a stylized phoenix m.png";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await register(username, email, password);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/20 via-chart-2/20 to-primary/20 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
        <div className="relative z-10 text-center space-y-6">
          <img src={phoenixLogo} alt="Phoenix" className="h-32 w-32 mx-auto" />
          <h1 className="font-display text-5xl font-black bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            PHOENIX GAMES
          </h1>
          <p className="text-xl text-foreground/80">
            Join the Ultimate Gaming Platform
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-8">
            <img src={phoenixLogo} alt="Phoenix" className="h-20 w-20 mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              PHOENIX GAMES
            </h1>
          </div>
          <RegisterForm onSubmit={handleRegister} />
        </div>
      </div>
    </div>
  );
}
