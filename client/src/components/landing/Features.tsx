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
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Features() {
  const { t } = useLanguage();
  
  const mainFeatures = [
    {
      icon: <Bot className="h-6 w-6" />,
      color: "from-blue-500 to-indigo-600",
      title: "Tạo nội dung AI tự động",
      description: "Hệ thống AI tiên tiến tự động phân tích và tạo nội dung chất lượng cao với giọng điệu phù hợp."
    },
    {
      icon: <Search className="h-6 w-6" />,
      color: "from-orange-500 to-amber-600",
      title: "Tối ưu hóa SEO chuyên sâu",
      description: "Phân tích từ khóa và tối ưu nội dung dựa trên thuật toán tìm kiếm mới nhất của Google."
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      color: "from-emerald-500 to-green-600",
      title: "Tích hợp đa nền tảng",
      description: "Xuất bản nội dung liền mạch sang WordPress, Facebook, TikTok và các kênh khác."
    }
  ];

  const additionalFeatures = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Phân tích hiệu suất",
      description: "Theo dõi hiệu suất nội dung với các số liệu và phân tích thời gian thực."
    },
    {
      icon: <Languages className="h-5 w-5" />,
      title: "Hỗ trợ đa ngôn ngữ",
      description: "Tạo nội dung bằng tiếng Việt và nhiều ngôn ngữ khác với độ chính xác cao."
    },
    {
      icon: <PanelTop className="h-5 w-5" />,
      title: "Bảng điều khiển trực quan",
      description: "Quản lý tất cả nội dung của bạn từ một giao diện người dùng đơn giản và trực quan."
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Thiết kế dựa trên mẫu",
      description: "Đa dạng mẫu nội dung cho blog, bài đăng mạng xã hội và các định dạng khác."
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Tạo nội dung nhanh chóng",
      description: "Tạo bài viết chỉ trong vài phút thay vì nhiều giờ soạn thảo thủ công."
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Kiểm tra toàn cầu",
      description: "Kiểm tra nội dung cho các thị trường quốc tế với phân tích văn hóa cụ thể."
    }
  ];

  return (
    <div id="features" className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -right-5 -top-5 w-24 h-24 bg-primary/10 rounded-full"></div>
        <div className="absolute left-1/4 top-1/3 w-36 h-36 bg-accent/5 rounded-full"></div>
        <div className="absolute right-1/3 bottom-1/4 w-48 h-48 bg-primary/5 rounded-full"></div>
        <div className="absolute -left-10 bottom-10 w-24 h-24 bg-secondary/10 rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary-600 text-sm font-medium mb-4">
            Các tính năng nổi bật
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent font-heading">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-secondary-600 mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </div>

        {/* Main features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
            >
              <div className={cn(
                "w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br text-white",
                feature.color
              )}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="mt-3 text-secondary-600 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <ul className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <li key={i} className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Tính năng mẫu {index+1}.{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary features in a grid */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-secondary-800 mb-8 text-center">
            Tất cả những gì bạn cần để tạo nội dung chất lượng
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex p-4 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="mr-4 flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-secondary-900">
                    {feature.title}
                  </h4>
                  <p className="mt-1 text-sm text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a 
              href="#" 
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Khám phá tất cả tính năng 
              <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
