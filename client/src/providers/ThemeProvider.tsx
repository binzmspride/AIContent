import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Theme } from "@shared/types";

type ThemeType = Theme | "system";

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: Theme;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("dark");
  
  // Function to get system theme preference
  const getSystemTheme = (): Theme => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  
  // Set theme in localStorage and update state
  const setTheme = (newTheme: ThemeType) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };
  
  // Effect to initialize theme from localStorage and handle system preference
  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem("theme") as ThemeType | null;
    
    // Set initial theme
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      setThemeState("dark");
      localStorage.setItem("theme", "dark");
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };
    
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);
  
  // Effect to resolve theme based on system preference if needed
  useEffect(() => {
    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(theme as Theme);
    }
  }, [theme]);
  
  // Effect to apply theme class to document
  useEffect(() => {
    // Remove previous theme class
    document.documentElement.classList.remove("light", "dark");
    
    // Add current theme class
    document.documentElement.classList.add(resolvedTheme);
    
    // Add transition class for smooth color transitions
    document.documentElement.classList.add("theme-transition");
    
    // Remove transition class after animations complete to prevent transition during unrelated changes
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [resolvedTheme]);
  
  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "light" ? "dark" : "light");
    }
  };
  
  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}