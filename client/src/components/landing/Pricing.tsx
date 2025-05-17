import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Check, Zap, Server, Crown, Sparkles, Star, Shield, Database, Award, Users, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type PackageInfo = {
  name: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
  isPopular: boolean;
  color: string;
  period?: string;
  highlightFeature?: string;
};

export function Pricing() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'credit' | 'storage'>('credit');

  const creditPackages: PackageInfo[] = [
    {
      name: t("landing.pricing.packages.basic"),
      price: 500000,
      icon: <Zap className="h-6 w-6" />,
      highlightFeature: "50 credits",
      features: [
        `50 ${t("landing.pricing.features.credits")}`,
        `~1000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")}`,
        `${t("landing.pricing.features.support")} (${t("landing.pricing.features.supportEmail")})`
      ],
      isPopular: false,
      color: "blue"
    },
    {
      name: t("landing.pricing.packages.advanced"),
      price: 900000,
      icon: <Sparkles className="h-6 w-6" />,
      highlightFeature: "100 credits",
      features: [
        `100 ${t("landing.pricing.features.credits")}`,
        `~1500 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} +`,
        `${t("landing.pricing.features.support")} (${t("landing.pricing.features.supportPriority")})`,
        `10% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: true,
      color: "accent"
    },
    {
      name: t("landing.pricing.packages.professional"),
      price: 2000000,
      icon: <Crown className="h-6 w-6" />,
      highlightFeature: "250 credits",
      features: [
        `250 ${t("landing.pricing.features.credits")}`,
        `~2000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} ++`,
        `${t("landing.pricing.features.support")} (${t("landing.pricing.features.support247")})`,
        `20% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: false,
      color: "purple"
    }
  ];

  const storagePackages: PackageInfo[] = [
    {
      name: t("landing.pricing.packages.storageBasic"),
      price: 200000,
      period: "month",
      icon: <Database className="h-6 w-6" />,
      highlightFeature: "5GB storage",
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
      name: t("landing.pricing.packages.storageBusiness"),
      price: 500000,
      period: "month",
      icon: <Award className="h-6 w-6" />,
      highlightFeature: "20GB storage",
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
      name: t("landing.pricing.packages.storageEnterprise"),
      price: 1000000,
      period: "month",
      icon: <Shield className="h-6 w-6" />,
      highlightFeature: "Unlimited articles",
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

  function getIconBgColor(color: string) {
    switch(color) {
      case 'blue': return "bg-gradient-to-br from-blue-500 to-blue-600";
      case 'accent': return "bg-gradient-to-br from-accent to-accent-600";
      case 'violet': return "bg-gradient-to-br from-violet-500 to-violet-600";
      case 'purple': return "bg-gradient-to-br from-purple-500 to-purple-600";
      default: return "bg-gradient-to-br from-blue-500 to-blue-600";
    }
  }

  const featuredIcons = {
    users: <Users className="h-5 w-5 text-gray-400" />,
    clock: <Clock className="h-5 w-5 text-gray-400" />,
    star: <Star className="h-5 w-5 text-gray-400" />
  };

  return (
    <div id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="absolute left-0 top-1/4 w-64 h-64 bg-gradient-radial from-primary/10 to-transparent rounded-full"></div>
        <div className="absolute right-0 bottom-1/4 w-64 h-64 bg-gradient-radial from-accent/10 to-transparent rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400 text-sm font-medium mb-4 border border-primary/20 dark:border-primary-800/50">
            <Star className="w-4 h-4 mr-2" />
            Gói dịch vụ linh hoạt
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-800 to-primary-600 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent font-heading mb-4">
            {t("landing.pricing.title")}
          </h2>
          
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        {/* Comparison grid for larger screens */}
        <div className="hidden lg:block mb-16">
          <div className="grid grid-cols-4 gap-4 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Header row */}
            <div className="bg-gray-100 dark:bg-gray-800/80 p-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Tính năng</h3>
            </div>
            
            {/* Package headers */}
            {creditPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-6 text-center border-b border-gray-200 dark:border-gray-700",
                  pkg.isPopular ? "bg-primary-50 dark:bg-primary-900/20" : "bg-gray-100 dark:bg-gray-800/80"
                )}
              >
                {pkg.isPopular && (
                  <div className="mb-3 text-center">
                    <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Thanh toán một lần
                </div>
              </div>
            ))}
            
            {/* Features rows */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 col-span-1 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <featuredIcons.users />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Credits</span>
              </div>
            </div>
            
            {creditPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-6 text-center border-t border-gray-200 dark:border-gray-700",
                  pkg.isPopular ? "bg-primary-50/50 dark:bg-primary-900/10" : "bg-white dark:bg-gray-800"
                )}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {pkg.features[0].split(' ')[0]} credits
                </div>
              </div>
            ))}
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 col-span-1 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <featuredIcons.star />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Words per credit</span>
              </div>
            </div>
            
            {creditPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-6 text-center border-t border-gray-200 dark:border-gray-700",
                  pkg.isPopular ? "bg-primary-50/50 dark:bg-primary-900/10" : "bg-white dark:bg-gray-800"
                )}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {pkg.features[1].split('~')[1].split(' ')[0]}
                </div>
              </div>
            ))}
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 col-span-1 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <featuredIcons.clock />
                <span className="ml-3 text-gray-700 dark:text-gray-300">SEO Optimization</span>
              </div>
            </div>
            
            {creditPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-6 text-center border-t border-gray-200 dark:border-gray-700",
                  pkg.isPopular ? "bg-primary-50/50 dark:bg-primary-900/10" : "bg-white dark:bg-gray-800"
                )}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {pkg.features[2].includes('+') ? (
                    <span className="text-green-600 dark:text-green-400">{pkg.features[2].split(" ").pop()}</span>
                  ) : (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                  )}
                </div>
              </div>
            ))}
            
            {/* Action row */}
            <div className="p-6 col-span-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            </div>
            
            {creditPackages.map((pkg, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-6 border-t border-gray-200 dark:border-gray-700",
                  pkg.isPopular ? "bg-primary-50/50 dark:bg-primary-900/10" : "bg-white dark:bg-gray-800"
                )}
              >
                <Link href="/auth">
                  <Button
                    className={cn(
                      "w-full py-2 shadow-sm transition-all duration-300",
                      pkg.isPopular 
                        ? "bg-primary hover:bg-primary/90" 
                        : "bg-white text-primary border border-primary hover:bg-primary/10"
                    )}
                  >
                    {pkg.isPopular ? "Mua ngay" : "Chọn gói"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Plan selection tabs */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-12">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-md inline-flex">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('credit')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeTab === 'credit' 
                    ? "bg-primary text-white shadow-md" 
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400"
                )}
              >
                {t("landing.pricing.creditPlans")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('storage')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeTab === 'storage' 
                    ? "bg-primary text-white shadow-md" 
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400"
                )}
              >
                {t("landing.pricing.storagePlans")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
            {(activeTab === 'credit' ? creditPackages : storagePackages).map((pkg: PackageInfo, index) => (
              <div
                key={index}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1",
                  pkg.isPopular 
                    ? "ring-2 ring-primary dark:ring-primary-400 border-0 md:scale-105 relative z-10" 
                    : "border border-gray-200 dark:border-gray-700"
                )}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-4 inset-x-0 mx-auto w-max bg-primary dark:bg-primary-600 text-white text-xs font-bold py-1 px-4 rounded-full shadow-md">
                    {t("landing.pricing.popular")}
                  </div>
                )}
                
                <div className="p-8">
                  {/* Icon and header */}
                  <div className="mb-8 flex flex-col items-center text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-xl mb-4 flex items-center justify-center text-white",
                      getIconBgColor(pkg.color)
                    )}>
                      {pkg.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>
                    {pkg.highlightFeature && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                        {pkg.highlightFeature}
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {formatCurrency(pkg.price)}
                    </div>
                    {pkg.period && (
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        mỗi {pkg.period}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
                  
                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 mr-3">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Action button */}
                  <Link href="/auth">
                    <Button
                      className={cn(
                        "w-full rounded-xl py-6 font-medium text-base transition-all duration-300",
                        pkg.isPopular
                          ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/10"
                          : "bg-white dark:bg-gray-800 text-primary dark:text-primary-400 border border-primary dark:border-primary-800/50 hover:bg-primary/10 dark:hover:bg-primary-900/20"
                      )}
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
        </div>
          
        <div className="mt-16 text-center">
          <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("landing.pricing.guarantee")} 
            <a href="#contact" className="text-primary dark:text-primary-400 font-medium hover:underline ml-1">
              {t("landing.pricing.contactUs")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
