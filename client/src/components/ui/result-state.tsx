import React from "react";
import { motion } from "framer-motion";
import { Mascot } from "./mascot";
import { cn } from "@/lib/utils";
import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";

export interface ResultStateProps {
  status: "success" | "error" | "empty" | "partial";
  title?: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
  mascotSize?: "sm" | "md" | "lg";
  actionButton?: React.ReactNode;
}

export function ResultState({
  status,
  title,
  message,
  children,
  className,
  mascotSize = "md",
  actionButton
}: ResultStateProps) {
  const { t } = useDbTranslations();
  
  const getDefaultTitle = () => {
    switch (status) {
      case "success":
        return t("common.success") || "Thành công!";
      case "error":
        return t("common.error") || "Đã xảy ra lỗi";
      case "empty":
        return t("common.noData") || "Không có dữ liệu";
      case "partial":
        return t("common.partialResults") || "Kết quả một phần";
      default:
        return "";
    }
  };
  
  const getDefaultMessage = () => {
    switch (status) {
      case "success":
        return t("common.operationSuccess") || "Thao tác đã được thực hiện thành công.";
      case "error":
        return t("common.errorOccurred") || "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      case "empty":
        return t("common.noDataFound") || "Không tìm thấy dữ liệu nào. Hãy thử lại với tìm kiếm khác.";
      case "partial":
        return t("common.partialResultsFound") || "Chỉ tìm thấy một phần kết quả. Có thể đã xảy ra lỗi trong quá trình tải.";
      default:
        return "";
    }
  };
  
  const getMascotExpression = () => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "empty":
        return "confused";
      case "partial":
        return "thinking";
      default:
        return "idle";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-lg text-center",
        className
      )}
    >
      <Mascot 
        expression={getMascotExpression() as any} 
        size={mascotSize} 
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-4 space-y-2"
      >
        <h3 className="text-xl font-semibold">
          {title || getDefaultTitle()}
        </h3>
        
        {message || getDefaultMessage() ? (
          <p className="text-muted-foreground max-w-md">
            {message || getDefaultMessage()}
          </p>
        ) : null}
      </motion.div>

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-6 w-full max-w-md"
        >
          {children}
        </motion.div>
      )}

      {actionButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          {actionButton}
        </motion.div>
      )}
    </motion.div>
  );
}