import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Check } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" data-testid="button-theme-selector">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="flex items-center justify-between"
            data-testid={`theme-${t.value}`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{t.label}</span>
              <span className="text-xs text-muted-foreground">{t.colors}</span>
            </div>
            {theme === t.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
