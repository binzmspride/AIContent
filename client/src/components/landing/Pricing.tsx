import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Check, Zap, Server, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type PackageInfo = {
  name: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
  isPopular: boolean;
  color: string;
  period?: string;
};

export function Pricing() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'credit' | 'storage'>('credit');

  const creditPackages: PackageInfo[] = [
    {
      name: t("dashboard.credits.packages.basic"),
      price: 500000,
      icon: <Zap className="h-6 w-6 text-blue-400" />,
      features: [
        `50 ${t("landing.pricing.features.credits")}`,
        `~1000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")}`,
        `${t("landing.pricing.features.support")} (email)`
      ],
      isPopular: false,
      color: "blue"
    },
    {
      name: t("dashboard.credits.packages.advanced"),
      price: 900000,
      icon: <Sparkles className="h-6 w-6 text-accent" />,
      features: [
        `100 ${t("landing.pricing.features.credits")}`,
        `~1500 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} +`,
        `${t("landing.pricing.features.support")} (priority)`,
        `10% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: true,
      color: "accent"
    },
    {
      name: t("dashboard.credits.packages.professional"),
      price: 2000000,
      icon: <Crown className="h-6 w-6 text-purple-500" />,
      features: [
        `250 ${t("landing.pricing.features.credits")}`,
        `~2000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} ++`,
        `${t("landing.pricing.features.support")} (24/7)`,
        `20% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: false,
      color: "purple"
    }
  ];

  const storagePackages: PackageInfo[] = [
    {
      name: "Gói Lưu Trữ Basic",
      price: 200000,
      period: "month",
      icon: <Server className="h-6 w-6 text-blue-400" />,
      features: [
        `50 ${t("landing.pricing.features.maxArticles")}`,
        `5GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (weekly)`,
        `1 ${t("landing.pricing.features.wpConnections")}`
      ],
      isPopular: false,
      color: "blue"
    },
    {
      name: "Gói Lưu Trữ Business",
      price: 500000,
      period: "month",
      icon: <Server className="h-6 w-6 text-violet-500" />,
      features: [
        `200 ${t("landing.pricing.features.maxArticles")}`,
        `20GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (daily)`,
        `3 ${t("landing.pricing.features.wpConnections")}`,
        `${t("landing.pricing.features.socialConnect")}`
      ],
      isPopular: true,
      color: "violet"
    },
    {
      name: "Gói Lưu Trữ Enterprise",
      price: 1000000,
      period: "month",
      icon: <Server className="h-6 w-6 text-purple-500" />,
      features: [
        `${t("landing.pricing.features.maxArticles")} (unlimited)`,
        `50GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (realtime)`,
        `${t("landing.pricing.features.wpConnections")} (unlimited)`,
        `${t("landing.pricing.features.socialConnect")} (all)`,
        `${t("landing.pricing.features.apiAccess")}`
      ],
      isPopular: false,
      color: "purple"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div id="pricing" className="py-20 bg-gradient-to-b from-white to-slate-100 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent-foreground rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-heading mb-3">
            {t("landing.pricing.title")}
          </h2>
          <div className="h-1 w-20 bg-accent mx-auto mb-6 rounded-full"></div>
          <p className="max-w-2xl text-xl text-secondary-foreground/70 mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        <div className="mt-12">
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-full shadow-md inline-flex">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('credit')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === 'credit' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {t("landing.pricing.creditPlans")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('storage')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === 'storage' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {t("landing.pricing.storagePlans")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
            {(activeTab === 'credit' ? creditPackages : storagePackages).map((pkg: PackageInfo, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  pkg.isPopular 
                    ? 'ring-2 ring-accent border-0 md:scale-105 relative z-10' 
                    : 'border border-slate-200/60'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-5 inset-x-0 mx-auto w-max bg-accent text-primary-foreground text-xs font-bold py-1.5 px-4 rounded-full shadow-md">
                    {t("landing.pricing.popular")}
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className={`text-xl font-bold ${pkg.isPopular ? 'text-secondary-foreground' : 'text-secondary-foreground'}`}>
                        {pkg.name}
                      </h3>
                      <div className="flex items-baseline mt-2">
                        <span className={`text-3xl font-extrabold ${pkg.isPopular ? 'text-secondary-foreground' : 'text-secondary-foreground'}`}>
                          {formatCurrency(pkg.price)}
                        </span>
                        {pkg.period && (
                          <span className="ml-1 text-sm text-secondary-foreground/60">
                            /{pkg.period}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      pkg.color === 'accent' 
                        ? 'bg-accent/10' 
                        : pkg.color === 'blue' 
                          ? 'bg-blue-50'
                          : 'bg-purple-50'
                    }`}>
                      {pkg.icon}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 my-6"></div>
                  
                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-secondary-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/auth">
                    <Button
                      className={`w-full rounded-xl py-6 shadow-md transition-all duration-300 ${
                        pkg.isPopular
                          ? 'bg-accent text-primary-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20'
                          : pkg.color === 'blue'
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
                            : 'bg-purple-500 text-primary-foreground hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/20'
                      }`}
                    >
                      {activeTab === 'credit' 
                        ? t("landing.pricing.buyNow")
                        : t("landing.pricing.subscribe")
                      }
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t("landing.pricing.guarantee")} 
              <a href="#contact" className="text-primary font-medium underline ml-1">
                {t("landing.pricing.contactUs")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
