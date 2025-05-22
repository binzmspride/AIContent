import { useLanguage } from "@/hooks/use-language";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function Faq() {
  const { t } = useLanguage();
  
  // Define static faq items based on the locale files' structure
  const faqItems = [
    {
      question: t("landing.faq.questions.0.question"),
      answer: t("landing.faq.questions.0.answer"),
    },
    {
      question: t("landing.faq.questions.1.question"),
      answer: t("landing.faq.questions.1.answer"),
    },
    {
      question: t("landing.faq.questions.2.question"),
      answer: t("landing.faq.questions.2.answer"),
    },
    {
      question: t("landing.faq.questions.3.question"),
      answer: t("landing.faq.questions.3.answer"),
    },
    {
      question: t("landing.faq.questions.4.question"),
      answer: t("landing.faq.questions.4.answer"),
    },
  ];

  return (
    <div id="faq" className="py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -left-10 top-20 w-40 h-40 bg-primary/5 rounded-full dark:bg-primary-900/20"></div>
        <div className="absolute right-0 bottom-20 w-60 h-60 bg-accent/5 rounded-full dark:bg-accent-900/10"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400 text-sm font-medium mb-4 border border-primary/20 dark:border-primary-800/50">
            <HelpCircle className="w-4 h-4 mr-2" />
            Câu hỏi thường gặp
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-heading mb-4">
            {t("landing.faq.title")}
          </h2>
          
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
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
        </div>
      </div>
    </div>
  );
}
