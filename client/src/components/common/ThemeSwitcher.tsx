import { Moon, Sun, Computer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeSwitcherProps {
  variant?: "default" | "outline" | "ghost" | "icon";
  showLabels?: boolean;
  className?: string;
  showDropdown?: boolean;
}

export function ThemeSwitcher({
  variant = "default",
  showLabels = false,
  className = "",
  showDropdown = true,
}: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sau khi component mount mới hiển thị để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Hiệu ứng gradient cho nút chuyển đổi
  const getGradientColor = () => {
    if (resolvedTheme === "light") {
      return "hsl(var(--theme-switcher-light) / 0.2)";
    } else {
      return "hsl(var(--theme-switcher-dark) / 0.2)";
    }
  };
  
  // Hiệu ứng đổi màu khi hover
  const getHoverGradientColor = () => {
    if (resolvedTheme === "light") {
      return "hsl(var(--theme-switcher-light) / 0.3)";
    } else {
      return "hsl(var(--theme-switcher-dark) / 0.3)";
    }
  };

  // Nút chuyển đổi đơn giản
  const themeButtonContent = (
    <>
      <div className="relative z-10 flex items-center gap-2">
        {resolvedTheme === "light" ? (
          <Moon className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
        ) : (
          <Sun className={showLabels ? "h-4 w-4" : "h-5 w-5"} />
        )}
        {showLabels && (
          <span>
            {resolvedTheme === "light" 
              ? "Chế độ tối" 
              : "Chế độ sáng"}
          </span>
        )}
      </div>
      
      {/* Hiệu ứng gradient */}
      <motion.div
        className="absolute inset-0 rounded-md"
        initial={false}
        animate={{
          backgroundColor: getGradientColor(),
        }}
        whileHover={{
          backgroundColor: getHoverGradientColor(),
        }}
        transition={{ duration: 0.3 }}
      />
    </>
  );

  // Nếu không sử dụng dropdown menu
  if (!showDropdown) {
    return (
      <Button
        variant={variant === "icon" ? "ghost" : variant}
        size={variant === "icon" ? "icon" : "default"}
        onClick={toggleTheme}
        aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        className={`relative overflow-hidden ${className}`}
      >
        {themeButtonContent}
      </Button>
    );
  }

  // Dropdown menu cho phép chọn nhiều chế độ
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "icon" ? "ghost" : variant}
          size={variant === "icon" ? "icon" : "default"}
          aria-label="Toggle theme"
          className={`relative overflow-hidden ${className}`}
        >
          {themeButtonContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          <span>Chế độ sáng</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          <span>Chế độ tối</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <Computer className="h-4 w-4" />
          <span>Theo hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}