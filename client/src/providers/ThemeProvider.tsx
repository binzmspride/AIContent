import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Theme } from "@shared/types";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  
  // Effect to initialize theme from localStorage and handle system preference
  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (storedTheme) {
      // Use the stored theme
      setTheme(storedTheme);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  
  // Effect to apply theme class to document and store in localStorage
  useEffect(() => {
    // Remove previous theme class
    document.documentElement.classList.remove("light", "dark");
    
    // Add current theme class
    document.documentElement.classList.add(theme);
    
    // Store theme preference
    localStorage.setItem("theme", theme);
    
    // Add transition class for smooth color transitions
    document.documentElement.classList.add("theme-transition");
    
    // Remove transition class after animations complete to prevent transition during other changes
    const transitionEndHandler = () => {
      document.documentElement.classList.remove("theme-transition");
    };
    
    const transitionElements = document.querySelectorAll("*");
    transitionElements.forEach((element) => {
      element.addEventListener("transitionend", transitionEndHandler, { once: true });
    });
    
    return () => {
      transitionElements.forEach((element) => {
        element.removeEventListener("transitionend", transitionEndHandler);
      });
    };
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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