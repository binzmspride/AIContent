import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BoltIcon, 
  ArrowRightIcon, 
  SparklesIcon, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Globe2, 
  Share, 
  Star,
  TrendingUp
} from "lucide-react";

export function Hero() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full"></div>
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 md:pt-12">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            <SparklesIcon className="w-4 h-4 mr-2" />
            <span>{t("landing.hero.badge")}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t("landing.hero.title")}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
            {t("landing.hero.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left column */}
          <div className="lg:col-span-5 space-y-10">
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Zap, title: t("landing.hero.features.aiContent.title"), text: t("landing.hero.features.aiContent.description"), color: "text-blue-500" },
                { icon: Globe2, title: t("landing.hero.features.multilingual.title"), text: t("landing.hero.features.multilingual.description"), color: "text-amber-500" },
                { icon: Share, title: t("landing.hero.features.integration.title"), text: t("landing.hero.features.integration.description"), color: "text-emerald-500" },
                { icon: TrendingUp, title: t("landing.hero.features.analytics.title"), text: t("landing.hero.features.analytics.description"), color: "text-purple-500" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className={`rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-4 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.text}</p>
                </div>
              ))}
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth" className="flex-1">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white w-full py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base">
                  <BoltIcon className="w-5 h-5 mr-2" />
                  {t("landing.hero.tryFree")}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary py-6 rounded-xl"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t("landing.hero.viewDemo")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            {/* Reviews */}
            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/100?img=${20+i}`} 
                        alt="User" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">4.9/5</span> {t("landing.hero.reviews.from")} <span className="font-semibold">1,000+</span> {t("landing.hero.reviews.customers")}
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30">
                  {t("landing.hero.reviews.verified")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right column - App preview */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-3xl group">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
                
                {/* Browser controls */}
                <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4 flex-1 bg-white dark:bg-gray-600 rounded-md h-6 flex items-center px-3">
                    <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Screenshot */}
                <img 
                  src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80" 
                  alt="SEO AI Writer dashboard"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              
              {/* Feature call-outs */}
              <div className="absolute -top-4 -right-4 md:top-8 md:right-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 max-w-xs border border-gray-100 dark:border-gray-700 transform rotate-3 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                      <SparklesIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("landing.hero.callouts.seoOptimization.title")}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("landing.hero.callouts.seoOptimization.description")}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 md:bottom-10 md:left-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 max-w-xs border border-gray-100 dark:border-gray-700 transform -rotate-2 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("landing.hero.callouts.vietnameseSupport.title")}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("landing.hero.callouts.vietnameseSupport.description")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
