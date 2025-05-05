import React from "react";
import { motion } from "framer-motion";
import { Mascot } from "./mascot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  fullScreen?: boolean;
  variant?: "mascot" | "spinner" | "minimal";
  mascotSize?: "sm" | "md" | "lg";
  className?: string;
  hideContentWhileLoading?: boolean;
  maskOpacity?: number;
}

export function LoadingState({
  isLoading,
  children,
  loadingText = "Đang tải dữ liệu...",
  fullScreen = false,
  variant = "mascot",
  mascotSize = "md",
  className,
  hideContentWhileLoading = false,
  maskOpacity = 0.7
}: LoadingStateProps) {
  if (!isLoading) return <>{children}</>;

  const renderLoadingIndicator = () => {
    switch (variant) {
      case "mascot":
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Mascot expression="loading" size={mascotSize} />
            {loadingText && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-foreground font-medium text-center max-w-xs"
              >
                {loadingText}
              </motion.div>
            )}
          </div>
        );
      case "spinner":
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
            {loadingText && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-foreground font-medium text-center max-w-xs"
              >
                {loadingText}
              </motion.div>
            )}
          </div>
        );
      case "minimal":
        return (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <Loader2 className="h-4 w-4 text-primary" />
            </motion.div>
            {loadingText && (
              <span className="text-foreground text-xs font-medium">{loadingText}</span>
            )}
          </div>
        );
    }
  };

  // Full screen loading overlay
  if (fullScreen) {
    return (
      <div className={cn("relative", className)}>
        {!hideContentWhileLoading && <div className="opacity-50">{children}</div>}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          {renderLoadingIndicator()}
        </motion.div>
      </div>
    );
  }

  // Inline loading overlay
  return (
    <div className={cn("relative min-h-[100px]", className)}>
      {!hideContentWhileLoading && <div className="opacity-50">{children}</div>}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 bg-background/${Math.floor(maskOpacity * 100)} flex items-center justify-center z-10`}
      >
        {renderLoadingIndicator()}
      </motion.div>
    </div>
  );
}