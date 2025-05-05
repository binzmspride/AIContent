import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MascotExpression = 
  | "idle" 
  | "thinking" 
  | "happy" 
  | "confused" 
  | "loading" 
  | "success" 
  | "error";

export interface MascotProps {
  expression?: MascotExpression;
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  onClick?: () => void;
}

export function Mascot({
  expression = "idle",
  message,
  className,
  size = "md",
  animated = true,
  onClick
}: MascotProps) {
  const [randomBlink, setRandomBlink] = useState(false);
  
  // Randomly blink the mascot
  useEffect(() => {
    if (animated && expression !== "loading") {
      const blinkInterval = setInterval(() => {
        setRandomBlink(true);
        setTimeout(() => setRandomBlink(false), 200);
      }, Math.random() * 5000 + 2000);
      
      return () => clearInterval(blinkInterval);
    }
  }, [animated, expression]);
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-36 h-36",
  };
  
  const getExpression = () => {
    switch (expression) {
      case "thinking":
        return (
          <ThinkingExpression randomBlink={randomBlink} />
        );
      case "happy":
        return (
          <HappyExpression randomBlink={randomBlink} />
        );
      case "confused":
        return (
          <ConfusedExpression randomBlink={randomBlink} />
        );
      case "loading":
        return (
          <LoadingExpression />
        );
      case "success":
        return (
          <SuccessExpression randomBlink={randomBlink} />
        );
      case "error":
        return (
          <ErrorExpression randomBlink={randomBlink} />
        );
      case "idle":
      default:
        return (
          <IdleExpression randomBlink={randomBlink} />
        );
    }
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        className={cn(
          "relative bg-background border-2 border-foreground rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-105", 
          sizeClasses[size]
        )}
        onClick={onClick}
      >
        {getExpression()}
      </div>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 text-center max-w-xs text-sm"
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}

// Mascot expressions
function IdleExpression({ randomBlink }: { randomBlink: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Eyes */}
      <circle cx="35" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      <circle cx="65" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      
      {/* Smile */}
      <path d="M 35 60 Q 50 70 65 60" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ThinkingExpression({ randomBlink }: { randomBlink: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Eyes */}
      <circle cx="35" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      <circle cx="65" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      
      {/* Eyebrow */}
      <path d="M 28 30 Q 34 25 40 30" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      
      {/* Thinking mouth */}
      <path d="M 40 65 Q 50 65 60 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      
      {/* Thought bubble */}
      <circle cx="75" cy="25" r="4" fill="#333" />
      <circle cx="82" cy="15" r="7" fill="#333" />
    </svg>
  );
}

function HappyExpression({ randomBlink }: { randomBlink: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Eyes */}
      <path d="M 30 40 Q 35 35 40 40" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <path d="M 60 40 Q 65 35 70 40" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      
      {/* Big smile */}
      <path d="M 30 60 Q 50 75 70 60" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ConfusedExpression({ randomBlink }: { randomBlink: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Eyes */}
      <circle cx="35" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      <circle cx="65" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      
      {/* Eyebrows */}
      <path d="M 30 30 Q 35 25 40 32" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <path d="M 60 32 Q 65 25 70 30" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      
      {/* Confused mouth */}
      <path d="M 40 65 Q 45 60 60 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LoadingExpression() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Spinning eyes */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ originX: "35px", originY: "40px" }}
      >
        <circle cx="35" cy="40" r="8" fill="#EEE" />
        <circle cx="35" cy="40" r="3" fill="#333" />
      </motion.g>
      
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ originX: "65px", originY: "40px" }}
      >
        <circle cx="65" cy="40" r="8" fill="#EEE" />
        <circle cx="65" cy="40" r="3" fill="#333" />
      </motion.g>
      
      {/* Loading mouth - talking animation */}
      <motion.path 
        d="M 40 60 Q 50 65 60 60" 
        animate={{ d: ["M 40 60 Q 50 65 60 60", "M 40 65 Q 50 60 60 65", "M 40 60 Q 50 65 60 60"] }}
        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        fill="none" 
        stroke="#333" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

function SuccessExpression({ randomBlink }: { randomBlink: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Eyes */}
      <circle cx="35" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      <circle cx="65" cy="40" r={randomBlink ? "0" : "5"} fill="#333" />
      
      {/* Big smile */}
      <path d="M 30 55 Q 50 75 70 55" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      
      {/* Sparkles */}
      <motion.g
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <path d="M 85 30 L 90 35 L 85 40 L 80 35 Z" fill="#FF9933" />
        <path d="M 15 30 L 20 35 L 15 40 L 10 35 Z" fill="#FF9933" />
        <path d="M 50 5 L 55 10 L 50 15 L 45 10 Z" fill="#FF9933" />
      </motion.g>
    </svg>
  );
}

function ErrorExpression({ randomBlink }: { randomBlink: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#FFD166" />
      
      {/* Eyes as X */}
      <path d="M 30 35 L 40 45 M 40 35 L 30 45" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <path d="M 60 35 L 70 45 M 70 35 L 60 45" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      
      {/* Sad mouth */}
      <path d="M 35 65 Q 50 55 65 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      
      {/* Error symbol */}
      <motion.circle
        cx="80"
        cy="20"
        r="12"
        fill="#EF4444"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      <path d="M 76 20 L 84 20 M 80 16 L 80 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}