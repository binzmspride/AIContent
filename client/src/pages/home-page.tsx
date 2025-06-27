import { useDbTranslations } from "@/hooks/use-db-translations";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { FeedbackForm } from "@/components/landing/FeedbackForm";
import { Footer } from "@/components/landing/Footer";
import Head from "@/components/head";

export default function HomePage() {
  const { t } = useDbTranslations();

  return (
    <>
      <Head>
        <title>{t("common.appName")} - {t("landing.hero.title")}</title>
        <meta name="description" content={t("landing.hero.subtitle")} />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Hero />
        <Features />
        <Pricing />
        <Faq />
        <FeedbackForm />
        <Footer />
      </div>
    </>
  );
}
