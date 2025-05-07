import { useLanguage } from "@/hooks/use-language";
import { 
  Bot, 
  Search, 
  Globe, 
  Share2, 
  Languages, 
  LineChart 
} from "lucide-react";

export function Features() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Bot className="h-7 w-7" />,
      title: t("landing.features.items.0.title"),
      description: t("landing.features.items.0.description")
    },
    {
      icon: <Search className="h-7 w-7" />,
      title: t("landing.features.items.1.title"),
      description: t("landing.features.items.1.description")
    },
    {
      icon: <Share2 className="h-7 w-7" />,
      title: t("landing.features.items.2.title"),
      description: t("landing.features.items.2.description")
    }
  ];

  return (
    <div id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-secondary-900 font-heading">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-secondary-500 mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-secondary-50 rounded-xl p-8 shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-secondary-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-secondary-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
