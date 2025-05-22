import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, Zap, Server, Crown, Sparkles, Star, Shield, Database, Award, BarChart4 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type PackageInfo = {
  name: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
  isPopular: boolean;
  gradient: string;
  badge?: string;
  period?: string;
};

export function Pricing() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'credit' | 'storage'>('credit');

  const creditPackages: PackageInfo[] = [
    {
      name: t("landing.pricing.packages.basic"),
      price: 500000,
      icon: <Zap className="h-7 w-7 text-white" />,
      features: [
        `50 ${t("landing.pricing.features.credits")}`,
        `~1000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")}`,
        `${t("landing.pricing.features.support")} (${t("landing.pricing.features.supportEmail")})`
      ],
      isPopular: false,
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      name: t("landing.pricing.packages.advanced"),
      price: 900000,
      icon: <Sparkles className="h-7 w-7 text-white" />,
      badge: "Phổ biến nhất",
      features: [
        `100 ${t("landing.pricing.features.credits")}`,
        `~1500 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} +`,
        `${t("landing.pricing.features.support")} (${t("landing.pricing.features.supportPriority")})`,
        `10% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: true,
      gradient: "from-indigo-400 to-violet-500"
    },
    {
      name: t("landing.pricing.packages.professional"),
      price: 2000000,
      icon: <Crown className="h-7 w-7 text-white" />,
      features: [
        `250 ${t("landing.pricing.features.credits")}`,
        `~2000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} ++`,
        `${t("landing.pricing.features.support")} (${t("landing.pricing.features.support247")})`,
        `20% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: false,
      gradient: "from-pink-400 to-rose-500"
    }
  ];

  const storagePackages: PackageInfo[] = [
    {
      name: t("landing.pricing.packages.storageBasic"),
      price: 200000,
      period: "month",
      icon: <Database className="h-7 w-7 text-white" />,
      features: [
        `50 ${t("landing.pricing.features.maxArticles")}`,
        `5GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (weekly)`,
        `1 ${t("landing.pricing.features.wpConnections")}`
      ],
      isPopular: false,
      gradient: "from-sky-400 to-cyan-500"
    },
    {
      name: t("landing.pricing.packages.storageBusiness"),
      price: 500000,
      period: "month",
      icon: <BarChart4 className="h-7 w-7 text-white" />,
      badge: "Phổ biến nhất",
      features: [
        `200 ${t("landing.pricing.features.maxArticles")}`,
        `20GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (daily)`,
        `3 ${t("landing.pricing.features.wpConnections")}`,
        `${t("landing.pricing.features.socialConnect")}`
      ],
      isPopular: true,
      gradient: "from-amber-400 to-orange-500"
    },
    {
      name: t("landing.pricing.packages.storageEnterprise"),
      price: 1000000,
      period: "month",
      icon: <Shield className="h-7 w-7 text-white" />,
      features: [
        `${t("landing.pricing.features.maxArticles")} (unlimited)`,
        `50GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (realtime)`,
        `${t("landing.pricing.features.wpConnections")} (unlimited)`,
        `${t("landing.pricing.features.socialConnect")} (all)`,
        `${t("landing.pricing.features.apiAccess")}`
      ],
      isPopular: false,
      gradient: "from-fuchsia-400 to-purple-600"
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
    <div id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-gradient-to-b from-indigo-400/10 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-gradient-to-b from-cyan-400/10 to-transparent blur-3xl opacity-70"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/30 dark:to-cyan-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 border border-indigo-200/40 dark:border-indigo-800/50 shadow-sm">
            <Star className="w-4 h-4 mr-2" />
            Bảng giá linh hoạt
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-300 dark:to-cyan-400 font-heading mb-6">
            {t("landing.pricing.title")}
          </h2>
          
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        {/* Plan selection tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-lg inline-flex border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('credit')}
              className={cn(
                "px-8 py-3 rounded-full text-sm font-medium transition-all duration-200",
                activeTab === 'credit' 
                  ? "bg-indigo-500 text-white shadow-lg" 
                  : "bg-transparent text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
            >
              {t("landing.pricing.creditPlans")}
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={cn(
                "px-8 py-3 rounded-full text-sm font-medium transition-all duration-200",
                activeTab === 'storage' 
                  ? "bg-amber-500 text-white shadow-lg" 
                  : "bg-transparent text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
              )}
            >
              {t("landing.pricing.storagePlans")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
          {(activeTab === 'credit' ? creditPackages : storagePackages).map((pkg: PackageInfo, index) => (
            <div
              key={index}
              className={cn(
                "relative z-0 overflow-hidden group",
                pkg.isPopular ? "md:-mt-4 md:mb-4" : ""
              )}
            >
              {/* Background with gradient border effect */}
              <div className={cn(
                "absolute -z-10 rounded-[2rem] inset-0 p-0.5",
                pkg.isPopular 
                  ? `bg-gradient-to-b ${pkg.gradient}`
                  : "bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
              )}></div>
              
              {/* Main card */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] h-full flex flex-col p-1">
                <div className="flex flex-col flex-grow p-7 md:p-8">
                  {/* Popular badge */}
                  {pkg.badge && (
                    <div className={cn(
                      "absolute top-0 right-0 left-0 mx-auto w-max z-30 transform -translate-y-[16px] px-5 py-2 rounded-full text-sm font-bold text-white shadow-xl border-2 border-white dark:border-gray-800 animate-pulse",
                      "bg-gradient-to-r from-purple-600 to-indigo-700"
                    )}>
                      {pkg.badge}
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={cn(
                      "w-20 h-20 rounded-full mb-6 mx-auto flex items-center justify-center",
                      `bg-gradient-to-br ${pkg.gradient}`
                    )}>
                      {pkg.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {pkg.name}
                    </h3>
                    
                    <div className="flex items-end justify-center mb-1">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {formatCurrency(pkg.price)}
                      </span>
                      {pkg.period && (
                        <span className="ml-1 text-gray-500 dark:text-gray-400 pb-1">
                          /{pkg.period}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pkg.period ? 'Thanh toán hàng tháng' : 'Thanh toán một lần'}
                    </p>
                  </div>
                  
                  {/* Features list */}
                  <div className="space-y-4 flex-grow mb-8">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <div className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-3",
                          `bg-gradient-to-r ${pkg.gradient} bg-opacity-20`
                        )}>
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action button */}
                <div className={cn(
                  "p-7 md:p-8 -mt-4 rounded-b-[2rem] transition-all duration-300",
                  pkg.isPopular 
                    ? `bg-gradient-to-r ${pkg.gradient} group-hover:shadow-lg`
                    : "bg-gray-50 dark:bg-gray-800/50"
                )}>
                  <div 
                    onClick={() => window.location.href = '/auth'}
                    className={cn(
                      "block w-full py-4 rounded-xl text-base font-medium text-center transition-all duration-300 cursor-pointer",
                      pkg.isPopular
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : `bg-gradient-to-r ${pkg.gradient} text-white hover:opacity-90`
                    )}
                  >
                    {activeTab === 'credit' 
                      ? t("landing.pricing.buyNow")
                      : t("landing.pricing.subscribe")
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
          
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("landing.pricing.guarantee")}
          </p>
        </div>
      </div>
    </div>
  );
}
