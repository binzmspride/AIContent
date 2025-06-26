import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/ui/mascot";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { X } from "lucide-react";

interface MascotTip {
  title: string;
  content: string;
  expression?: "idle" | "thinking" | "happy" | "confused";
}

export interface MascotHelperProps {
  page: "dashboard" | "content-creation" | "articles" | "connections" | "credits" | "plans";
  className?: string;
  onDismiss?: () => void;
}

export function MascotHelper({ page, className, onDismiss }: MascotHelperProps) {
  const { t, language } = useLanguage();
  const [currentTip, setCurrentTip] = useState<MascotTip | null>(null);
  const [dismissed, setDismissed] = useState(false);
  
  // Get tips based on current page
  const getTips = (): MascotTip[] => {
    switch (page) {
      case "dashboard":
        return [
          {
            title: t("common.mascot.dashboard.welcomeTitle") || "Xin chào!",
            content: t("common.mascot.dashboard.welcomeTip") || "Chào mừng bạn đến với SEO AI Writer! Đây là nơi bạn có thể xem tổng quan về tài khoản của mình.",
            expression: "happy" as const
          },
          {
            title: t("common.mascot.dashboard.creditsTitle") || "Tín dụng",
            content: t("common.mascot.dashboard.creditsTip") || "Số tín dụng hiển thị ở bảng điều khiển cho biết bạn có thể tạo bao nhiêu bài viết mới.",
            expression: "thinking" as const
          },
          {
            title: t("common.mascot.dashboard.articlesTitle") || "Bài viết của bạn",
            content: t("common.mascot.dashboard.articlesTip") || "Bạn có thể xem các bài viết gần đây của mình tại đây và nhấp vào để chỉnh sửa hoặc xuất bản.",
            expression: "idle" as const
          }
        ];
      case "content-creation":
        return [
          {
            title: t("common.mascot.contentCreation.welcomeTitle") || "Bắt đầu tạo nội dung!",
            content: t("common.mascot.contentCreation.welcomeTip") || "Hãy điền đầy đủ thông tin để tạo bài viết SEO chất lượng cao.",
            expression: "happy" as const
          },
          {
            title: t("common.mascot.contentCreation.tipsTitle") || "Mẹo tạo nội dung",
            content: t("common.mascot.contentCreation.tipsList") || "Sử dụng từ khóa chính xác, chọn giọng điệu phù hợp với đối tượng, và cung cấp mô tả chi tiết để có kết quả tốt nhất.",
            expression: "thinking" as const
          },
          {
            title: t("common.mascot.contentCreation.creditsTitle") || "Sử dụng tín dụng",
            content: t("common.mascot.contentCreation.creditsTip") || "Mỗi bài viết sẽ sử dụng từ 1-3 tín dụng tùy thuộc vào độ dài bạn chọn.",
            expression: "idle" as const
          }
        ];
      case "articles":
        return [
          {
            title: t("common.mascot.articles.welcomeTitle") || "Bài viết của bạn",
            content: t("common.mascot.articles.welcomeTip") || "Đây là nơi bạn có thể quản lý tất cả bài viết đã tạo.",
            expression: "happy"
          },
          {
            title: t("common.mascot.articles.publishTitle") || "Xuất bản bài viết",
            content: t("common.mascot.articles.publishTip") || "Bạn có thể xuất bản bài viết lên WordPress hoặc mạng xã hội sau khi đã kết nối tài khoản.",
            expression: "thinking"
          }
        ];
      case "connections":
        return [
          {
            title: t("common.mascot.connections.welcomeTitle") || "Kết nối tài khoản",
            content: t("common.mascot.connections.welcomeTip") || "Kết nối WordPress và các mạng xã hội để xuất bản bài viết trực tiếp.",
            expression: "happy"
          },
          {
            title: t("common.mascot.connections.wordpressTitle") || "WordPress",
            content: t("common.mascot.connections.wordpressTip") || "Để kết nối WordPress, bạn cần URL trang web, tên người dùng và Application Password.",
            expression: "thinking"
          }
        ];
      case "credits":
        return [
          {
            title: t("common.mascot.credits.welcomeTitle") || "Quản lý tín dụng",
            content: t("common.mascot.credits.welcomeTip") || "Mua thêm tín dụng để tiếp tục tạo nội dung chất lượng cao.",
            expression: "happy"
          },
          {
            title: t("common.mascot.credits.usageTitle") || "Sử dụng tín dụng",
            content: t("common.mascot.credits.usageTip") || "Tín dụng được sử dụng khi tạo nội dung mới và không có thời hạn sử dụng.",
            expression: "idle"
          }
        ];
      case "plans":
        return [
          {
            title: t("common.mascot.plans.welcomeTitle") || "Gói đăng ký",
            content: t("common.mascot.plans.welcomeTip") || "Nâng cấp lên gói cao hơn để nhận nhiều tín dụng và dung lượng lưu trữ hơn.",
            expression: "happy"
          },
          {
            title: t("common.mascot.plans.featuresTitle") || "Tính năng",
            content: t("common.mascot.plans.featuresTip") || "Các gói cao cấp bao gồm thêm tính năng như hỗ trợ ưu tiên và nhiều kết nối hơn.",
            expression: "thinking"
          }
        ];
      default:
        return [
          {
            title: t("common.mascot.general.welcomeTitle") || "Xin chào!",
            content: t("common.mascot.general.welcomeTip") || "Tôi là trợ lý AI của bạn. Tôi sẽ giúp bạn sử dụng hệ thống này hiệu quả nhất.",
            expression: "happy"
          }
        ];
    }
  };
  
  // Rotate through tips
  useEffect(() => {
    if (dismissed) return;
    
    const tips = getTips();
    console.log("useEffect tips:", tips);
    if (tips.length === 0) return;
    
    let currentIndex = 0;
    console.log("Setting initial tip:", tips[0]);
    setCurrentTip(tips[0]);
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % tips.length;
      console.log("Rotating to tip:", tips[currentIndex]);
      setCurrentTip(tips[currentIndex]);
    }, 12000); // Change tip every 12 seconds
    
    return () => clearInterval(interval);
  }, [page, dismissed, language]); // Add language dependency
  
  if (dismissed || !currentTip) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="relative border-2 border-primary/20 shadow-lg overflow-visible">
        <CardContent className="pt-6 pb-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6" 
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Mascot 
              expression={currentTip.expression || "idle"} 
              size="md"
              className="flex-shrink-0"
            />
            
            <div className="space-y-2 text-center sm:text-left">
              <motion.h3
                key={`title-${currentTip.title}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-lg text-primary"
              >
                {currentTip.title}
              </motion.h3>
              
              <motion.p
                key={`content-${currentTip.content}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm"
              >
                {currentTip.content}
              </motion.p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}