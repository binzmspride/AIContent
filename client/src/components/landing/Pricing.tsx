import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function Pricing() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'credit' | 'storage'>('credit');

  const creditPackages = [
    {
      name: t("dashboard.credits.packages.basic"),
      price: 500000,
      features: [
        `50 ${t("landing.pricing.features.credits")}`,
        `~1000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")}`,
        `${t("landing.pricing.features.support")} (email)`
      ],
      isPopular: false
    },
    {
      name: t("dashboard.credits.packages.advanced"),
      price: 900000,
      features: [
        `100 ${t("landing.pricing.features.credits")}`,
        `~1500 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} +`,
        `${t("landing.pricing.features.support")} (priority)`,
        `10% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: true
    },
    {
      name: t("dashboard.credits.packages.professional"),
      price: 2000000,
      features: [
        `250 ${t("landing.pricing.features.credits")}`,
        `~2000 ${t("landing.pricing.features.wordsPerCredit")}`,
        `${t("landing.pricing.features.seoOptimization")} ++`,
        `${t("landing.pricing.features.support")} (24/7)`,
        `20% ${t("landing.pricing.features.saving")}`
      ],
      isPopular: false
    }
  ];

  const storagePackages = [
    {
      name: "Gói Lưu Trữ Basic",
      price: 200000,
      period: "month",
      features: [
        `50 ${t("landing.pricing.features.maxArticles")}`,
        `5GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (weekly)`,
        `1 ${t("landing.pricing.features.wpConnections")}`
      ],
      isPopular: false
    },
    {
      name: "Gói Lưu Trữ Business",
      price: 500000,
      period: "month",
      features: [
        `200 ${t("landing.pricing.features.maxArticles")}`,
        `20GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (daily)`,
        `3 ${t("landing.pricing.features.wpConnections")}`,
        `${t("landing.pricing.features.socialConnect")}`
      ],
      isPopular: false
    },
    {
      name: "Gói Lưu Trữ Enterprise",
      price: 1000000,
      period: "month",
      features: [
        `${t("landing.pricing.features.maxArticles")} (unlimited)`,
        `50GB ${t("landing.pricing.features.storage")}`,
        `${t("landing.pricing.features.backup")} (realtime)`,
        `${t("landing.pricing.features.wpConnections")} (unlimited)`,
        `${t("landing.pricing.features.socialConnect")} (all)`,
        `${t("landing.pricing.features.apiAccess")}`
      ],
      isPopular: false
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
    <div id="pricing" className="py-16 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-secondary-900 font-heading">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-secondary-500 mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        <div className="mt-10">
          <div className="flex justify-center space-x-4 mb-10">
            <Button
              variant={activeTab === 'credit' ? 'default' : 'outline'}
              onClick={() => setActiveTab('credit')}
              className="px-8"
            >
              {t("landing.pricing.creditPlans")}
            </Button>
            <Button
              variant={activeTab === 'storage' ? 'default' : 'outline'}
              onClick={() => setActiveTab('storage')}
              className="px-8"
            >
              {t("landing.pricing.storagePlans")}
            </Button>
          </div>

          {activeTab === 'credit' ? (
            <>
              <h3 className="text-xl font-semibold text-secondary-900 text-center mb-8">
                {t("landing.pricing.creditPlans")}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {creditPackages.map((pkg, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 border ${
                      pkg.isPopular ? 'border-2 border-accent-500 transform scale-105' : 'border-secondary-200'
                    }`}
                  >
                    <div className={`${pkg.isPopular ? 'bg-accent-500' : 'bg-primary-600'} text-white px-6 py-4 relative`}>
                      {pkg.isPopular && (
                        <div className="absolute -top-4 right-0 left-0 mx-auto w-max bg-accent-600 text-white text-xs font-bold py-1 px-3 rounded-full">
                          {t("landing.pricing.popular")}
                        </div>
                      )}
                      <h4 className="text-lg font-semibold">{pkg.name}</h4>
                      <div className="mt-1 text-2xl font-bold">{formatCurrency(pkg.price)}</div>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/auth">
                        <Button
                          className={`mt-6 w-full ${
                            pkg.isPopular ? 'bg-accent-500 hover:bg-accent-600' : 'bg-primary-600 hover:bg-primary-700'
                          }`}
                        >
                          {t("landing.pricing.buyNow")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-secondary-900 text-center mb-8">
                {t("landing.pricing.storagePlans")}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {storagePackages.map((pkg, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 border border-secondary-200"
                  >
                    <div className="bg-secondary-700 text-white px-6 py-4">
                      <h4 className="text-lg font-semibold">{pkg.name}</h4>
                      <div className="mt-1 text-2xl font-bold">
                        {formatCurrency(pkg.price)}
                        <span className="text-sm font-normal">/{pkg.period}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/auth">
                        <Button className="mt-6 w-full bg-secondary-700 hover:bg-secondary-800">
                          {t("landing.pricing.subscribe")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
