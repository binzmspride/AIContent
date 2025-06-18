import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { AdaptiveThemeSwitcher } from "./AdaptiveThemeSwitcher";

interface FloatingThemeOrbProps {
  showSwitcher?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function FloatingThemeOrb({ 
  showSwitcher = true, 
  position = "bottom-right" 
}: FloatingThemeOrbProps) {
  const { resolvedTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [30, -30]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-30, 30]), springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-6 left-6";
      case "top-right":
        return "top-6 right-6";
      case "top-left":
        return "top-6 left-6";
      default:
        return "bottom-6 right-6";
    }
  };

  const getThemeColors = () => {
    switch (resolvedTheme) {
      case "light":
        return {
          primary: "from-yellow-300 via-orange-400 to-pink-400",
          secondary: "from-yellow-200 to-orange-300",
          glow: "shadow-yellow-300/50",
          particle: "bg-yellow-400",
        };
      case "dark":
        return {
          primary: "from-blue-500 via-purple-600 to-indigo-700",
          secondary: "from-blue-400 to-purple-500",
          glow: "shadow-blue-500/50",
          particle: "bg-blue-400",
        };
      default:
        return {
          primary: "from-gray-400 via-gray-500 to-gray-600",
          secondary: "from-gray-300 to-gray-400",
          glow: "shadow-gray-400/50",
          particle: "bg-gray-500",
        };
    }
  };

  const colors = getThemeColors();

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  return (
    <motion.div
      className={`fixed ${getPositionClasses()} z-50 group`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, type: "spring" }}
    >
      {/* Main orb container */}
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.primary} blur-xl ${colors.glow}`}
          animate={{
            scale: isHovered ? 1.3 : 1,
            opacity: isHovered ? 0.6 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Middle ring */}
        <motion.div
          className={`absolute inset-2 rounded-full bg-gradient-to-r ${colors.secondary} opacity-50`}
          animate={{
            rotate: 360,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.3 },
          }}
        />
        
        {/* Inner core */}
        <motion.div
          className="relative w-16 h-16 rounded-full overflow-hidden"
          animate={{
            rotate: isHovered ? 180 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className={`w-full h-full bg-gradient-to-br ${colors.primary}`} />
          
          {/* Animated light streaks */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: [-100, 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transform: "rotate(45deg)" }}
          />
        </motion.div>

        {/* Floating particles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 ${colors.particle} rounded-full opacity-60`}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
              opacity: [0.6, 1, 0.4, 0.6],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${15 + i * 10}%`,
            }}
          />
        ))}

        {/* Theme switcher overlay */}
        {showSwitcher && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <AdaptiveThemeSwitcher
              variant="ghost"
              showDropdown={false}
              playful={true}
              size="md"
              className="w-full h-full rounded-full border-0 bg-transparent hover:bg-transparent"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          y: isHovered ? 0 : 10 
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-black/80 dark:bg-white/80 text-white dark:text-black px-2 py-1 rounded text-xs whitespace-nowrap">
          Đổi chế độ hiển thị
        </div>
      </motion.div>
    </motion.div>
  );
}