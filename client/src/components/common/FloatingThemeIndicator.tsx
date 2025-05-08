import { useState, useEffect } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";

interface FloatingThemeIndicatorProps {
  show?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function FloatingThemeIndicator({ 
  show = true, 
  position = "bottom-right" 
}: FloatingThemeIndicatorProps) {
  const { theme, resolvedTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  
  // Chỉ hiển thị trong 2 giây sau khi theme thay đổi
  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [theme, show]);
  
  // Xác định vị trí
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };
  
  // Xác định icon và màu
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5 text-amber-500" />;
      case "dark":
        return <Moon className="h-5 w-5 text-indigo-400" />;
      case "system":
        return <Monitor className="h-5 w-5 text-slate-400" />;
      default:
        return null;
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          <motion.div 
            className="flex items-center space-x-2 rounded-full bg-card px-4 py-2 shadow-lg border border-border"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30 
            }}
          >
            {getThemeIcon()}
            <span className="font-medium capitalize">
              {theme === "system" 
                ? `System (${resolvedTheme})` 
                : theme}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}