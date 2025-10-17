import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import phoenixLogo from "@assets/a stylized phoenix m.png";
import ThemeSelector from "./ThemeSelector";
import PrivacyModeToggle from "./PrivacyModeToggle";
import LanguageSelector from "./LanguageSelector";

interface HeaderProps {
  user?: { username: string; role: string } | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 hover-elevate rounded-md px-3 py-2 -ml-3">
          <img src={phoenixLogo} alt="Phoenix Games" className="h-10 w-10" />
          <span className="font-display text-xl font-bold bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            PHOENIX GAMES
          </span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search games..."
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrivacyModeToggle />
          <LanguageSelector />
          <ThemeSelector />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" data-testid="button-user-menu">
                  <User className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild data-testid="menu-admin">
                    <Link href="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} data-testid="menu-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild data-testid="button-login">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" asChild data-testid="button-register">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
