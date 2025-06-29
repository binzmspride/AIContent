import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'vi' | 'en';
export type TranslationKey = string;

// Define translations type structure
type TranslationData = {
  [key: string]: string | TranslationData | Array<any>;
};

type TranslationsType = {
  vi: TranslationData;
  en: TranslationData;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Hardcoded translations for essential UI elements
const translations: TranslationsType = {
  vi: {
    common: {
      loading: "Đang gửi...",
      error: "Lỗi",
      success: "Thành công",
      cancel: "Hủy",
      save: "Lưu",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      view: "Xem",
      create: "Tạo mới",
      update: "Cập nhật"
    },

    landing: {
      navbar: {
        features: "Tính năng",
        pricing: "Bảng giá",
        faq: "FAQ",
        login: "Đăng nhập",
        getStarted: "Bắt đầu"
      },
      
      hero: {
        title: "Tạo nội dung SEO chuyên nghiệp bằng AI",
        subtitle: "Sức mạnh của trí tuệ nhân tạo giúp bạn tạo ra các bài viết SEO chất lượng cao, tối ưu hóa từ khóa và tăng thứ hạng tìm kiếm một cách dễ dàng.",
        getStarted: "Bắt đầu ngay",
        watchDemo: "Xem demo",
        trustedBy: "Được tin tưởng bởi",
        companies: "hơn 1000 doanh nghiệp"
      },
      
      features: {
        title: "Tính năng mạnh mẽ",
        subtitle: "Lợi ích nổi bật",
        categories: {
          content: {
            title: "Tạo nội dung thông minh",
            ai: {
              title: "AI Content Generation", 
              description: "Tạo nội dung chất lượng cao với sự hỗ trợ của công nghệ AI tiên tiến"
            },
            seo: {
              title: "SEO Optimization",
              description: "Tự động phân tích và tối ưu hóa từ khóa để cải thiện thứ hạng tìm kiếm"
            },
            multilingual: {
              title: "Multi-language Support", 
              description: "Hỗ trợ tạo nội dung đa ngôn ngữ cho thị trường toàn cầu"
            }
          },
          analytics: {
            title: "Tối ưu hóa & Phân tích",
            keywords: {
              title: "Nghiên cứu từ khóa",
              description: "Phân tích và đề xuất từ khóa có tiềm năng chuyển đổi cao"
            },
            performance: {
              title: "Phân tích hiệu suất",
              description: "Theo dõi và phân tích hiệu quả nội dung trong thời gian thực"
            },
            technical: {
              title: "Tối ưu hóa kỹ thuật",
              description: "Tự động tối ưu hóa cấu trúc và thẻ meta để cải thiện điểm SEO kỹ thuật"
            }
          },
          management: {
            title: "Quản lý & Xuất bản",
            templates: {
              title: "Thư viện mẫu",
              description: "Truy cập thư viện đa dạng các mẫu nội dung chuyên nghiệp"
            },
            multilingual: {
              title: "Hỗ trợ đa ngôn ngữ",
              description: "Tạo và tối ưu hóa nội dung cho các thị trường ngôn ngữ khác nhau"
            },
            dashboard: {
              title: "Bảng điều khiển",
              description: "Quản lý tất cả nội dung và lịch xuất bản từ một giao diện"
            }
          }
        },
        items: [
          {
            title: "Tạo nội dung thông minh", 
            description: "Tạo ra các bài viết chất lượng cao với sự hỗ trợ của công nghệ AI tiên tiến."
          },
          {
            title: "Tối ưu hóa từ khóa",
            description: "Tự động phân tích và tối ưu hóa từ khóa để cải thiện thứ hạng tìm kiếm."
          },
          {
            title: "Xuất bản đa nền tảng",
            description: "Xuất bản trực tiếp lên WordPress hoặc mạng xã hội chỉ với một cú nhấp chuột."
          }
        ]
      },
      pricing: {
        title: "Bảng giá",
        subtitle: "Chọn gói phù hợp với nhu cầu của bạn",
        creditPlans: "Gói Tín Dụng",
        storagePlans: "Gói Lưu Trữ", 
        features: {
          aiGeneration: "Tạo nội dung AI",
          seoOptimization: "Tối ưu hóa SEO",
          keywordResearch: "Nghiên cứu từ khóa",
          contentTemplates: "Mẫu nội dung",
          analytics: "Phân tích chi tiết",
          apiAccess: "Truy cập API",
          prioritySupport: "Hỗ trợ ưu tiên",
          customIntegration: "Tích hợp tùy chỉnh",
          socialConnect: "Kết nối mạng xã hội"
        },
        buyNow: "Mua ngay",
        guarantee: "Đảm bảo hoàn tiền trong 30 ngày",
        contactUs: "Liên hệ với chúng tôi",
        badge: "Giá cả linh hoạt",
        mostPopular: "Phổ biến nhất",
        viewPlans: "Xem các gói dịch vụ",
        oneTimePayment: "Thanh toán một lần"
      },
      faq: {
        title: "Câu hỏi thường gặp",
        subtitle: "Những câu hỏi được hỏi nhiều nhất",
        badge: "Câu hỏi thường gặp",
        questions: [
          {
            question: "SEO AI Writer hoạt động như thế nào để tạo nội dung?",
            answer: "SEO AI Writer sử dụng công nghệ AI tiên tiến để phân tích từ khóa, nghiên cứu chủ đề và tạo ra nội dung chất lượng cao được tối ưu hóa cho SEO."
          },
          {
            question: "Tôi có thể tạo bao nhiêu bài viết mỗi tháng?",
            answer: "Điều này phụ thuộc vào gói dịch vụ bạn đăng ký. Mỗi gói cung cấp một số lượng tín dụng nhất định mà bạn có thể sử dụng để tạo nội dung. Một bài viết thường tiêu tốn 10-50 tín dụng tùy thuộc vào độ dài và độ phức tạp."
          },
          {
            question: "Nội dung được tạo ra có độc đáo không?",
            answer: "Có, tất cả nội dung được tạo bởi SEO AI Writer đều độc đáo và được thiết kế để vượt qua các công cụ kiểm tra đạo văn. Hệ thống của chúng tôi liên tục học hỏi và cập nhật để tạo ra nội dung chất lượng cao nhất."
          },
          {
            question: "Tôi có thể tích hợp với WordPress của mình không?",
            answer: "Có, SEO AI Writer cung cấp tích hợp liền mạch với WordPress, cho phép bạn xuất bản nội dung trực tiếp lên website của mình chỉ với một cú nhấp chuột."
          },
          {
            question: "Dịch vụ của bạn hỗ trợ những ngôn ngữ nào?",
            answer: "Hiện tại, chúng tôi hỗ trợ tiếng Việt và tiếng Anh. Chúng tôi đang nỗ lực mở rộng danh sách các ngôn ngữ được hỗ trợ trong thời gian tới."
          }
        ]
      },
      footer: {
        product: {
          title: "Sản phẩm",
          features: "Tính năng",
          pricing: "Bảng giá",
          api: "API",
          integrations: "Tích hợp"
        },
        company: {
          title: "Công ty",
          about: "Về chúng tôi",
          blog: "Blog", 
          careers: "Tuyển dụng",
          
          support: "Hỗ trợ",
          helpCenter: "Trung tâm trợ giúp",
          terms: "Điều khoản dịch vụ",
          privacy: "Chính sách bảo mật",
          contact: "Liên hệ"
        }
      },
      feedback: {
        title: "Góp ý & Phản hồi",
        subtitle: "Ý kiến của bạn rất quan trọng với chúng tôi. Hãy chia sẻ trải nghiệm, đề xuất cải tiến hoặc báo cáo lỗi để giúp chúng tôi phát triển tốt hơn.",
        form: {
          name: "Họ và tên",
          namePlaceholder: "Nhập họ và tên của bạn",
          subject: "Chủ đề",
          subjectPlaceholder: "Tóm tắt nội dung bạn muốn chia sẻ",
          message: "Nội dung",
          messagePlaceholder: "Mô tả chi tiết ý kiến, đề xuất hoặc vấn đề bạn gặp phải...",
          submit: "Gửi phản hồi"
        },
        validation: {
          nameMin: "Tên phải có ít nhất 2 ký tự",
          emailInvalid: "Vui lòng nhập email hợp lệ",
          subjectMin: "Chủ đề phải có ít nhất 5 ký tự",
          messageMin: "Tin nhắn phải có ít nhất 10 ký tự"
        },
        success: {
          title: "Cảm ơn bạn!",
          description: "Feedback của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể."
        },
        error: {
          description: "Có lỗi xảy ra khi gửi feedback. Vui lòng thử lại."
        },
        contact: "Bạn cũng có thể liên hệ trực tiếp qua email: support@seoaiwriter.com"
      }
    },
    
    dashboard: {
      title: "Bảng điều khiển",
      overview: "Tổng quan",
      insights: "Thông tin chi tiết",
      myArticles: "Bài viết của tôi",
      createContent: "Tạo nội dung"
    }
  },
  
  en: {
    common: {
      loading: "Sending...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      create: "Create",
      update: "Update"
    },

    landing: {
      navbar: {
        features: "Features",
        pricing: "Pricing",
        faq: "FAQ",
        login: "Login",
        getStarted: "Get Started"
      },
      
      hero: {
        title: "Create Professional SEO Content with AI",
        subtitle: "Harness the power of artificial intelligence to create high-quality SEO articles, optimize keywords, and boost search rankings effortlessly.",
        getStarted: "Get Started",
        watchDemo: "Watch Demo",
        trustedBy: "Trusted by",
        companies: "over 1000 businesses"
      },
      
      features: {
        title: "Powerful Features",
        subtitle: "Outstanding Benefits",
        categories: {
          content: {
            title: "Intelligent Content Creation",
            ai: {
              title: "AI Content Generation", 
              description: "Create high-quality content with the help of advanced AI technology"
            },
            seo: {
              title: "SEO Optimization",
              description: "Automatically analyze and optimize keywords to improve search rankings"
            },
            multilingual: {
              title: "Multi-language Support", 
              description: "Support content creation in multiple languages for global markets"
            }
          },
          analytics: {
            title: "Optimization & Analytics",
            keywords: {
              title: "Keyword Research",
              description: "Analyze and suggest keywords with high conversion potential"
            },
            performance: {
              title: "Performance Analysis",
              description: "Track and analyze content effectiveness in real-time"
            },
            technical: {
              title: "Technical Optimization",
              description: "Automatically optimize structure and meta tags to improve technical SEO scores"
            }
          },
          management: {
            title: "Management & Publishing",
            templates: {
              title: "Template Library",
              description: "Access diverse library of professional content templates"
            },
            multilingual: {
              title: "Multilingual Support",
              description: "Create and optimize content for different language markets"
            },
            dashboard: {
              title: "Dashboard",
              description: "Manage all content and publishing schedules from one interface"
            }
          }
        },
        items: [
          {
            title: "Intelligent Content Creation",
            description: "Create high-quality articles with the help of advanced AI technology."
          },
          {
            title: "Keyword Optimization",
            description: "Automatic keyword analysis and optimization to improve search rankings."
          },
          {
            title: "Multi-platform Publishing",
            description: "Publish directly to WordPress or social media with just one click."
          }
        ]
      },
      pricing: {
        title: "Pricing",
        subtitle: "Choose a plan that fits your needs",
        creditPlans: "Credit Plans",
        storagePlans: "Storage Plans",
        features: {
          aiGeneration: "AI Content Generation",
          seoOptimization: "SEO Optimization",
          keywordResearch: "Keyword Research",
          contentTemplates: "Content Templates",
          analytics: "Detailed Analytics",
          apiAccess: "API Access",
          prioritySupport: "Priority Support",
          customIntegration: "Custom Integration",
          socialConnect: "Social media connections"
        },
        buyNow: "Buy Now",
        guarantee: "30-day money-back guarantee",
        contactUs: "Contact Us",
        badge: "Flexible Pricing",
        mostPopular: "Most Popular",
        viewPlans: "View Plans",
        oneTimePayment: "One-time Payment"
      },
      faq: {
        title: "Frequently Asked Questions",
        subtitle: "Most commonly asked questions",
        badge: "Frequently Asked Questions",
        questions: [
          {
            question: "How does SEO AI Writer help create content?",
            answer: "SEO AI Writer uses advanced AI technology to analyze keywords, research topics, and generate high-quality content that is optimized for SEO."
          },
          {
            question: "How many articles can I create per month?",
            answer: "This depends on the service package you subscribe to. Each package provides a certain number of credits that you can use to generate content. An article typically consumes 10-50 credits depending on length and complexity."
          },
          {
            question: "Is the generated content unique?",
            answer: "Yes, all content created by SEO AI Writer is unique and designed to pass plagiarism checkers. Our system continuously learns and updates to produce the highest quality content."
          },
          {
            question: "Can I integrate with my WordPress?",
            answer: "Yes, SEO AI Writer provides seamless integration with WordPress, allowing you to publish content directly to your website with just one click."
          },
          {
            question: "What languages does your service support?",
            answer: "Currently, we support Vietnamese and English. We are working to expand our list of supported languages in the near future."
          }
        ]
      },
      footer: {
        product: {
          title: "Product",
          features: "Features",
          pricing: "Pricing",
          api: "API",
          integrations: "Integrations"
        },
        company: {
          title: "Company",
          about: "About Us",
          blog: "Blog", 
          careers: "Careers",
          
          support: "Support",
          helpCenter: "Help Center",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          contact: "Contact"
        }
      },
      feedback: {
        title: "Feedback & Comments",
        subtitle: "Your opinion is very important to us. Share your experience, suggest improvements or report bugs to help us develop better.",
        form: {
          name: "Full Name",
          namePlaceholder: "Enter your full name",
          subject: "Subject",
          subjectPlaceholder: "Brief summary of what you want to share",
          message: "Message",
          messagePlaceholder: "Detailed description of your opinion, suggestions or issues you encountered...",
          submit: "Send Feedback"
        },
        validation: {
          nameMin: "Name must be at least 2 characters",
          emailInvalid: "Please enter a valid email",
          subjectMin: "Subject must be at least 5 characters",
          messageMin: "Message must be at least 10 characters"
        },
        success: {
          title: "Thank you!",
          description: "Your feedback has been sent successfully. We will respond as soon as possible."
        },
        error: {
          description: "An error occurred while sending feedback. Please try again."
        },
        contact: "You can also contact us directly via email: support@seoaiwriter.com"
      }
    },
    
    dashboard: {
      title: "Dashboard",
      overview: "Overview",
      insights: "Insights",
      myArticles: "My Articles",
      createContent: "Create Content"
    }
  }
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {},
  t: (key: string) => key,
});

export { LanguageContext };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    console.log('[LanguageProvider] Initial language from localStorage:', stored);
    return (stored as Language) || 'vi';
  });

  const handleSetLanguage = (lang: Language) => {
    console.log('[LanguageProvider] setLanguage called with:', lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
    console.log('[LanguageProvider] Language changed to:', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};