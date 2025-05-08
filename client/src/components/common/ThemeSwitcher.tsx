import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ThemeSwitcherProps {
  variant?: "default" | "outline" | "ghost" | "icon";
  showLabels?: boolean;
  className?: string;
}

export function ThemeSwitcher({
  variant = "default",
  showLabels = false,
  className = "",
}: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sau khi component mount mới hiển thị để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant={variant === "icon" ? "ghost" : variant}
      size={variant === "icon" ? "icon" : "default"}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`relative overflow-hidden ${className}`}
    >
      <div className="relative z-10 flex items-center gap-2">
        {theme === "light" ? (
          <Moon className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
        ) : (
          <Sun className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
        )}
        {showLabels && <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>}
      </div>
      
      {/* Hiệu ứng chuyển đổi */}
      <motion.div
        className="absolute inset-0 rounded bg-gradient-to-br"
        initial={false}
        animate={{
          backgroundColor: theme === "light" 
            ? "rgba(59, 130, 246, 0.1)" 
            : "rgba(234, 179, 8, 0.1)",
        }}
        transition={{ duration: 0.6 }}
      />
    </Button>
  );
}