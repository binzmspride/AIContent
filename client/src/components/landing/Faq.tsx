import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
  const { t, language } = useLanguage();
  
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
    <div id="faq" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-secondary-900 font-heading">
            {t("landing.faq.title")}
          </h2>
          <p className="mt-4 text-xl text-secondary-500">
            {t("landing.faq.subtitle")}
          </p>
        </div>

        <div className="mt-12 space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-secondary-50 rounded-lg px-6 py-2 mb-4"
              >
                <AccordionTrigger className="text-lg font-medium text-secondary-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-secondary-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
