import { Moon, Sun, Computer, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdaptiveThemeSwitcherProps {
  variant?: "default" | "outline" | "ghost" | "icon" | "floating";
  showLabels?: boolean;
  className?: string;
  showDropdown?: boolean;
  playful?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AdaptiveThemeSwitcher({
  variant = "default",
  showLabels = false,
  className = "",
  showDropdown = true,
  playful = true,
  size = "md",
}: AdaptiveThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    sm: { icon: "h-4 w-4", button: "h-8 w-8", sparkle: "h-2 w-2" },
    md: { icon: "h-5 w-5", button: "h-10 w-10", sparkle: "h-3 w-3" },
    lg: { icon: "h-6 w-6", button: "h-12 w-12", sparkle: "h-4 w-4" },
  };

  const config = sizeConfig[size];

  // Theme-specific colors and animations
  const getThemeConfig = () => {
    switch (resolvedTheme) {
      case "light":
        return {
          gradient: "from-yellow-200 to-orange-300",
          glow: "shadow-yellow-200/50",
          particle: "bg-yellow-400",
          icon: Sun,
          nextLabel: "Chế độ tối",
          bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
          hoverColor: "hover:from-yellow-100 hover:to-orange-100",
        };
      case "dark":
        return {
          gradient: "from-blue-600 to-purple-700",
          glow: "shadow-blue-500/50",
          particle: "bg-blue-400",
          icon: Moon,
          nextLabel: "Chế độ sáng",
          bgColor: "bg-gradient-to-r from-slate-800 to-slate-900",
          hoverColor: "hover:from-slate-700 hover:to-slate-800",
        };
      default:
        return {
          gradient: "from-gray-400 to-gray-600",
          glow: "shadow-gray-400/50",
          particle: "bg-gray-500",
          icon: Computer,
          nextLabel: "Theo hệ thống",
          bgColor: "bg-gradient-to-r from-gray-100 to-gray-200",
          hoverColor: "hover:from-gray-200 hover:to-gray-300",
        };
    }
  };

  const themeConfig = getThemeConfig();
  const IconComponent = themeConfig.icon;

  // Sparkle effect
  const createSparkles = () => {
    if (!playful) return;
    
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
    }));
    
    setSparkles(newSparkles);
    
    setTimeout(() => {
      setSparkles([]);
    }, 1000);
  };

  // Handle theme toggle with animations
  const handleThemeToggle = () => {
    setIsAnimating(true);
    createSparkles();
    toggleTheme();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  // Handle theme selection with animations
  const handleThemeSelect = (newTheme: "light" | "dark" | "system") => {
    setIsAnimating(true);
    createSparkles();
    setTheme(newTheme);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  // Button content with animations
  const buttonContent = (
    <motion.div
      className="relative flex items-center justify-center"
      whileHover={playful ? { scale: 1.05 } : {}}
      whileTap={playful ? { scale: 0.95 } : {}}
    >
      {/* Main icon with rotation animation */}
      <motion.div
        animate={isAnimating ? { rotate: 360 } : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative z-10"
      >
        <IconComponent className={`${config.icon} transition-colors duration-300`} />
      </motion.div>

      {/* Sparkle particles */}
      <AnimatePresence>
        {playful && sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className={`absolute ${config.sparkle} ${themeConfig.particle} rounded-full opacity-80`}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: sparkle.x,
              y: sparkle.y,
              opacity: [0, 1, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Glow effect */}
      {playful && (
        <motion.div
          className={`absolute inset-0 rounded-full ${themeConfig.gradient} opacity-0`}
          whileHover={{ opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Pulsing ring on theme change */}
      <AnimatePresence>
        {isAnimating && playful && (
          <motion.div
            className={`absolute inset-0 rounded-full border-2 border-current opacity-50`}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Label with slide animation */}
      {showLabels && (
        <motion.span
          className="ml-2 text-sm font-medium"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {themeConfig.nextLabel}
        </motion.span>
      )}
    </motion.div>
  );

  // Floating variant
  if (variant === "floating") {
    return (
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Button
          onClick={handleThemeToggle}
          size="icon"
          className={`
            ${config.button} rounded-full shadow-lg ${themeConfig.glow}
            ${themeConfig.bgColor} ${themeConfig.hoverColor}
            border-0 transition-all duration-300
          `}
          aria-label={`Switch to ${themeConfig.nextLabel.toLowerCase()}`}
        >
          {buttonContent}
        </Button>
      </motion.div>
    );
  }

  // Simple toggle button (no dropdown)
  if (!showDropdown) {
    return (
      <Button
        variant={variant === "icon" ? "ghost" : variant}
        size={variant === "icon" ? "icon" : "default"}
        onClick={handleThemeToggle}
        aria-label={`Switch to ${themeConfig.nextLabel.toLowerCase()}`}
        className={`relative overflow-hidden transition-all duration-300 ${className}`}
      >
        {buttonContent}
      </Button>
    );
  }

  // Dropdown menu version
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "icon" ? "ghost" : variant}
          size={variant === "icon" ? "icon" : "default"}
          aria-label="Toggle theme"
          className={`relative overflow-hidden transition-all duration-300 ${className}`}
        >
          {buttonContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DropdownMenuItem 
            onClick={() => handleThemeSelect("light")} 
            className="gap-3 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="h-4 w-4 text-yellow-500" />
            </motion.div>
            <span>Chế độ sáng</span>
            {theme === "light" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </motion.div>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleThemeSelect("dark")} 
            className="gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <motion.div
              whileHover={{ rotate: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="h-4 w-4 text-blue-500" />
            </motion.div>
            <span>Chế độ tối</span>
            {theme === "dark" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Sparkles className="h-3 w-3 text-blue-500" />
              </motion.div>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleThemeSelect("system")} 
            className="gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Computer className="h-4 w-4 text-gray-500" />
            </motion.div>
            <span>Theo hệ thống</span>
            {theme === "system" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <Zap className="h-3 w-3 text-gray-500" />
              </motion.div>
            )}
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}