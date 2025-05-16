import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FaqCategoryProps {
  title: string;
  items: {
    question: string;
    answer: string;
  }[];
  defaultOpen?: string;
}

function FaqCategory({ title, items, defaultOpen }: FaqCategoryProps) {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <Accordion 
        type="single" 
        collapsible 
        defaultValue={defaultOpen}
        className="w-full space-y-4"
      >
        {items.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-base md:text-lg font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-400 transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 text-gray-600 dark:text-gray-300">
              <div 
                className="prose prose-gray dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none" 
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function Faq() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // Get all FAQ items from translations
  const faqItems = [
    {
      question: t("landing.faq.questions.0.question"),
      answer: t("landing.faq.questions.0.answer"),
      category: "general"
    },
    {
      question: t("landing.faq.questions.1.question"),
      answer: t("landing.faq.questions.1.answer"),
      category: "general"
    },
    {
      question: t("landing.faq.questions.2.question"),
      answer: t("landing.faq.questions.2.answer"),
      category: "pricing"
    },
    {
      question: t("landing.faq.questions.3.question"),
      answer: t("landing.faq.questions.3.answer"),
      category: "pricing"
    },
    {
      question: t("landing.faq.questions.4.question"),
      answer: t("landing.faq.questions.4.answer"),
      category: "technical"
    },
  ];

  // Group items by category
  const categorizedFaqs = {
    general: faqItems.filter(item => item.category === "general"),
    pricing: faqItems.filter(item => item.category === "pricing"),
    technical: faqItems.filter(item => item.category === "technical"),
  };

  const tabs = [
    { id: "general", label: "Tổng quát", icon: HelpCircle },
    { id: "pricing", label: "Giá cả & Gói dịch vụ", icon: MessageCircle },
    { id: "technical", label: "Kỹ thuật", icon: HelpCircle },
  ];

  return (
    <div id="faq" className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 w-64 h-64 bg-gradient-radial from-primary/5 to-transparent rounded-full"></div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-radial from-accent/5 to-transparent rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400 text-sm font-medium mb-4 border border-primary/20 dark:border-primary-800/50">
            <HelpCircle className="w-4 h-4 mr-2" />
            Hỗ trợ & Giải đáp
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-800 to-primary-600 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent font-heading mb-4">
            {t("landing.faq.title")}
          </h2>
          
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-3/4">
            {/* Category tabs for larger screens */}
            <div className="hidden md:flex space-x-2 mb-8 border-b border-gray-200 dark:border-gray-700">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-5 py-2.5 text-sm font-medium border-b-2 -mb-px",
                    activeTab === tab.id 
                      ? "border-primary text-primary dark:border-primary-400 dark:text-primary-400" 
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <tab.icon className="inline-block w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dropdown for mobile */}
            <div className="md:hidden mb-6">
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3"
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>

            {/* FAQs content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8">
              {activeTab === "general" && (
                <FaqCategory 
                  title="Thông tin chung về dịch vụ" 
                  items={categorizedFaqs.general}
                  defaultOpen="item-0"
                />
              )}
              
              {activeTab === "pricing" && (
                <FaqCategory 
                  title="Thông tin về giá cả & gói dịch vụ" 
                  items={categorizedFaqs.pricing}
                  defaultOpen="item-0"
                />
              )}
              
              {activeTab === "technical" && (
                <FaqCategory 
                  title="Hỗ trợ kỹ thuật" 
                  items={categorizedFaqs.technical}
                  defaultOpen="item-0"
                />
              )}
              
              <div className="text-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Vẫn chưa tìm thấy câu trả lời cho câu hỏi của bạn?
                </p>
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary dark:border-primary-700/50 dark:text-primary-400 hover:border-primary hover:bg-primary/5"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Liên hệ hỗ trợ
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contact sidebar */}
          <div className="w-full lg:w-1/4 space-y-6 mt-8 lg:mt-0">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary-900/20 dark:to-primary-900/10 rounded-xl p-6 border border-primary/20 dark:border-primary-900/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Hỗ trợ trực tiếp
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng trả lời mọi thắc mắc của bạn.
              </p>
              <Button className="w-full bg-white text-primary hover:bg-gray-50 dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Trò chuyện ngay
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent-900/20 dark:to-accent-900/10 rounded-xl p-6 border border-accent/20 dark:border-accent-900/30">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tài liệu hướng dẫn
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Khám phá hướng dẫn chi tiết và tài liệu kỹ thuật về cách sử dụng dịch vụ.
              </p>
              <a 
                href="#"
                className="flex items-center justify-between text-sm font-medium text-primary dark:text-primary-400 hover:underline"
              >
                Xem tài liệu
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 dark:text-white">
                  Thời gian hỗ trợ
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Thứ 2 - Thứ 6:</span>
                  <span>8:00 - 18:00</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Thứ 7:</span>
                  <span>9:00 - 16:00</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Chủ nhật:</span>
                  <span>Đóng cửa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
