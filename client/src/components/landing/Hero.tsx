import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Hero() {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading leading-tight">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-100">
              {t("landing.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Link href="/auth">
                <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-white shadow-lg hover:shadow-xl transition duration-200">
                  {t("landing.hero.tryFree")}
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-primary-700 hover:bg-primary-50 transition duration-200"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t("landing.hero.viewDemo")}
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative rounded-lg shadow-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
                alt="AI Content Generation"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/30 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
