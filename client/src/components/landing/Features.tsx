import { useLanguage } from "@/hooks/use-language";
import { 
  Bot, 
  Search, 
  PanelTop,
  Share2, 
  Languages, 
  LineChart,
  TrendingUp,
  Layout,
  Globe,
  Zap,
  FileText,
  CheckCircle2,
  LucideIcon,
  Newspaper,
  BarChart4,
  LayoutTemplate,
  MessageSquare,
  Megaphone,
  Hash,
  ArrowRight,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  index: number;
}

function FeatureCard({ title, description, icon: Icon, iconColor, bgColor, index }: FeatureCardProps) {
  return (
    <div className={cn(
      "rounded-xl p-8 h-full group cursor-pointer",
      "border border-gray-200 dark:border-gray-700",
      "bg-white dark:bg-gray-800/50",
      "transition-all duration-500 ease-out",
      "hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20",
      "hover:-translate-y-2 hover:scale-[1.02]",
      "hover:border-gray-300 dark:hover:border-gray-600",
      "relative overflow-hidden"
    )}>
      {/* Subtle gradient overlay that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
      
      <div className="relative z-10">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
          "transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
          bgColor
        )}>
          <Icon className={cn(
            "h-7 w-7 transition-all duration-500",
            "group-hover:scale-110",
            iconColor
          )} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
          {description}
        </p>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 transition-all duration-300 group-hover:border-gray-200 dark:group-hover:border-gray-600">
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Lợi ích nổi bật:</span>
          </div>
          <ul className="mt-2 space-y-2">
            {[1, 2, 3].map(i => (
              <li key={i} className="flex items-start text-sm transform transition-all duration-300 group-hover:translate-x-1">
                <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-300" />
                <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  {
                    index === 0 ? [
                      "Tiết kiệm thời gian soạn thảo",
                      "Tăng chất lượng nội dung",
                      "Tự động đề xuất cải thiện"
                    ][i-1] :
                    index === 1 ? [
                      "Cải thiện thứ hạng trên Google",
                      "Phân tích đối thủ cạnh tranh",
                      "Đề xuất từ khóa tối ưu"
                    ][i-1] :
                    [
                      "Xuất bản với 1 click",
                      "Quản lý nội dung tập trung",
                      "Phân tích hiệu suất đăng bài"
                    ][i-1]
                  }
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  const { t } = useLanguage();
  
  const mainFeatures = [
    {
      icon: Bot,
      iconColor: "text-blue-50 dark:text-blue-100",
      bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
      title: t("landing.features.ai.title") || "Tạo nội dung AI tự động",
      description: t("landing.features.ai.description") || "Hệ thống AI tiên tiến tự động phân tích và tạo nội dung chất lượng cao với giọng điệu phù hợp cho mọi ngành nghề."
    },
    {
      icon: Search,
      iconColor: "text-amber-50 dark:text-amber-100",
      bgColor: "bg-gradient-to-br from-amber-500 to-orange-600", 
      title: t("landing.features.seo.title") || "Tối ưu hóa SEO chuyên sâu",
      description: t("landing.features.seo.description") || "Phân tích từ khóa và tối ưu nội dung dựa trên thuật toán tìm kiếm mới nhất của Google để tăng thứ hạng trang web."
    },
    {
      icon: Share2,
      iconColor: "text-emerald-50 dark:text-emerald-100",
      bgColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
      title: t("landing.features.integration.title") || "Tích hợp đa nền tảng",
      description: t("landing.features.integration.description") || "Xuất bản nội dung liền mạch sang WordPress, Facebook, TikTok và các kênh xã hội khác chỉ với vài cú nhấp chuột."
    }
  ];

  const categories = [
    {
      title: t("landing.features.categories.content.title") || "Tạo nội dung",
      features: [
        {
          icon: Newspaper,
          title: t("landing.features.categories.content.blog.title") || "Bài viết blog",
          description: t("landing.features.categories.content.blog.description") || "Tạo bài viết blog chuyên nghiệp với cấu trúc tối ưu SEO"
        },
        {
          icon: Megaphone,
          title: t("landing.features.categories.content.social.title") || "Nội dung mạng xã hội",
          description: t("landing.features.categories.content.social.description") || "Tạo nội dung hấp dẫn cho Facebook, Instagram và TikTok"
        },
        {
          icon: MessageSquare,
          title: t("landing.features.categories.content.email.title") || "Email marketing",
          description: t("landing.features.categories.content.email.description") || "Tạo email chiến dịch chuyên nghiệp với tỷ lệ mở cao"
        }
      ]
    },
    {
      title: t("landing.features.categories.analytics.title") || "Tối ưu & Phân tích",
      features: [
        {
          icon: Hash,
          title: t("landing.features.categories.analytics.keywords.title") || "Nghiên cứu từ khóa",
          description: t("landing.features.categories.analytics.keywords.description") || "Phân tích và đề xuất từ khóa có tiềm năng chuyển đổi cao"
        },
        {
          icon: BarChart4,
          title: t("landing.features.categories.analytics.performance.title") || "Phân tích hiệu suất",
          description: t("landing.features.categories.analytics.performance.description") || "Theo dõi và phân tích hiệu quả của nội dung theo thời gian thực"
        },
        {
          icon: Code,
          title: t("landing.features.categories.analytics.technical.title") || "Tối ưu kỹ thuật",
          description: t("landing.features.categories.analytics.technical.description") || "Tự động tối ưu cấu trúc và thẻ meta để tăng điểm SEO kỹ thuật"
        }
      ]
    },
    {
      title: t("landing.features.categories.management.title") || "Quản lý & Xuất bản",
      features: [
        {
          icon: LayoutTemplate,
          title: t("landing.features.categories.management.templates.title") || "Thư viện mẫu",
          description: t("landing.features.categories.management.templates.description") || "Truy cập thư viện đa dạng mẫu nội dung chuyên nghiệp"
        },
        {
          icon: Globe,
          title: t("landing.features.categories.management.multilingual.title") || "Hỗ trợ đa ngôn ngữ",
          description: t("landing.features.categories.management.multilingual.description") || "Tạo và tối ưu nội dung cho nhiều thị trường ngôn ngữ khác nhau"
        },
        {
          icon: PanelTop,
          title: t("landing.features.categories.management.dashboard.title") || "Bảng điều khiển",
          description: t("landing.features.categories.management.dashboard.description") || "Quản lý tất cả nội dung và lịch xuất bản từ một giao diện"
        }
      ]
    }
  ];

  return (
    <div id="features" className="py-24 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-1/4 w-1/2 h-1/2 bg-gradient-radial from-primary/5 to-transparent rounded-full"></div>
        <div className="absolute left-0 bottom-1/4 w-1/2 h-1/2 bg-gradient-radial from-accent/5 to-transparent rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm">
            <Zap className="w-4 h-4 mr-2" />
            Tính năng mạnh mẽ
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-800 to-primary-600 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent font-heading mb-4">
            {t("landing.features.title")}
          </h2>
          
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300 mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </div>

        {/* Main features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {mainFeatures.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconColor={feature.iconColor}
              bgColor={feature.bgColor}
              index={index}
            />
          ))}
        </div>

        {/* Categorized features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 md:p-10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Tất cả những gì bạn cần để tạo nội dung tuyệt vời
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Công cụ toàn diện giúp bạn tạo, tối ưu và xuất bản nội dung chất lượng cao trên mọi nền tảng
            </p>
            
            <div className="space-y-16">
              {categories.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-lg font-semibold text-primary dark:text-primary-400 mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
                    {category.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {category.features.map((feature, featureIdx) => (
                      <div 
                        key={featureIdx} 
                        className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
                      >
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary-400">
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 flex justify-center">
              <a 
                href="#pricing" 
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400 font-medium hover:bg-primary/20 dark:hover:bg-primary-900/50 transition-all duration-300 border border-primary/20 dark:border-primary-800/50 hover:shadow-md group"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Xem các gói dịch vụ 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
