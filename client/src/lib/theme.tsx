import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light" | "midnight" | "cyberpunk" | "forest";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; colors: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("phoenix-theme");
    return (saved as Theme) || "dark";
  });

  const themes = [
    { value: "dark" as Theme, label: "Dark Phoenix", colors: "Orange & Red" },
    { value: "light" as Theme, label: "Light Phoenix", colors: "Warm Tones" },
    { value: "midnight" as Theme, label: "Midnight Blaze", colors: "Blue & Purple" },
    { value: "cyberpunk" as Theme, label: "Cyber Phoenix", colors: "Neon Pink & Cyan" },
    { value: "forest" as Theme, label: "Forest Fire", colors: "Green & Amber" },
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light", "midnight", "cyberpunk", "forest");
    
    if (theme !== "light") {
      root.classList.add("dark");
    }
    root.classList.add(theme);
    
    localStorage.setItem("phoenix-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
