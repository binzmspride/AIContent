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

    admin: {
      adminPanel: "Quản trị viên",
      adminDashboard: "Bảng điều khiển quản trị",
      dashboard: "Bảng điều khiển",
      users: "Người dùng",
      articles: "Bài viết",
      
      usersManagement: {
        title: "Quản lý người dùng",
        description: "Xem và quản lý tất cả người dùng trong hệ thống",
        username: "Tên đăng nhập",
        email: "Email",
        fullName: "Họ và tên",
        role: "Vai trò",
        status: "Trạng thái",
        password: "Mật khẩu",
        passwordDescription: "Mật khẩu phải có ít nhất 6 ký tự",
        selectRole: "Chọn vai trò",
        selectStatus: "Chọn trạng thái",
        roleUser: "Người dùng",
        roleAdmin: "Quản trị viên",
        statusActive: "Đang hoạt động",
        statusInactive: "Không hoạt động",
        statusSuspended: "Đã bị khóa",
        allUsers: "Tất cả người dùng",
        totalCount: "Tổng số",
        users: "người dùng",
        joinDate: "Ngày tham gia",
        noUsers: "Không tìm thấy người dùng nào",
        adjustCredits: "Điều chỉnh credits",
        adjustCreditsForUser: "Điều chỉnh credits cho người dùng",
        currentCredits: "Số dư hiện tại",
        adjustmentAmount: "Số lượng điều chỉnh",
        adjustmentAmountDescription: "Nhập số dương để thêm credits, số âm để trừ credits",
        adjustmentReason: "Lý do điều chỉnh",
        adjustmentReasonPlaceholder: "Ví dụ: Khuyến mãi, hoàn tiền, điều chỉnh lỗi...",
        assignPlan: "Gán gói dịch vụ",
        assignPlanForUser: "Gán gói dịch vụ cho người dùng",
        selectPlan: "Chọn gói dịch vụ",
        selectPlanPlaceholder: "Chọn một gói dịch vụ",
        customDuration: "Thời gian sử dụng tùy chỉnh (ngày)",
        customDurationDescription: "Để trống để sử dụng thời gian mặc định của gói dịch vụ"
      },
      articlesManagement: {
        title: "Quản lý bài viết",
        description: "Xem và quản lý tất cả bài viết trong hệ thống",
        allArticles: "Tất cả bài viết",
        totalCount: "Tổng số",
        articles: "bài viết",
        search: "Tìm kiếm bài viết",
        author: "Tác giả",
        status: "Trạng thái",
        createdAt: "Ngày tạo",
        updatedAt: "Ngày cập nhật",
        allStatuses: "Tất cả trạng thái",
        noArticles: "Không tìm thấy bài viết nào",
        delete: "Xóa bài viết",
        edit: "Chỉnh sửa bài viết",
        view: "Xem chi tiết"
      },
      plans: "Gói dịch vụ",
      payments: "Thanh toán",
      performance: "Hiệu suất",
      integrations: "Tích hợp",
      history: "Lịch sử",
      settings: "Cài đặt",
      
      settingsPage: {
        title: "Cài đặt",
        general: "Cài đặt chung",
        generalDescription: "Cấu hình các thông tin chung của ứng dụng",
        siteName: "Tên trang web",
        siteDescription: "Mô tả trang web",
        contactEmail: "Email liên hệ",
        supportEmail: "Email hỗ trợ",
        enableNewUsers: "Cho phép đăng ký mới",
        enableNewUsersDescription: "Cho phép người dùng mới đăng ký tài khoản",
        enableArticleCreation: "Cho phép tạo bài viết",
        enableArticleCreationDescription: "Cho phép người dùng tạo bài viết mới",
        enableAutoPublish: "Cho phép tự động xuất bản",
        enableAutoPublishDescription: "Cho phép tự động xuất bản bài viết đến các kênh đã kết nối",
        maintenanceMode: "Chế độ bảo trì",
        maintenanceModeDescription: "Kích hoạt chế độ bảo trì, chỉ admin mới truy cập được",
        ai: "Cài đặt AI",
        email: "Cài đặt Email",
        api: "Tích hợp API",
        webhook: "Webhook",
        system: "Hệ thống",
        systemStatus: "Trạng thái hệ thống",
        version: "Phiên bản",
        database: "Cơ sở dữ liệu",
        lastBackup: "Sao lưu lần cuối",
        backupNow: "Sao lưu ngay",
        backingUp: "Đang sao lưu...",
        refreshSystemInfo: "Làm mới thông tin",
        systemLog: "Nhật ký hệ thống",
        systemInfoFooter: "Hệ thống được phát triển bởi SEO AI Writer Team. Để được hỗ trợ, vui lòng liên hệ support@example.com",
        webhookDescription: "Cấu hình webhook cho n8n và các dịch vụ khác",
        webhookSecret: "Khóa bí mật webhook",
        webhookSecretDescription: "Khóa bí mật để xác thực webhook, bắt đầu bằng 'whsec_'",
        notificationWebhook: "Webhook thông báo n8n",
        notificationWebhookDescription: "URL webhook để nhận thông báo về sự kiện hệ thống",
        availableWebhookEvents: "Sự kiện webhook có sẵn"
      },
      
      performanceMetrics: {
        title: "Số liệu hiệu suất",
        responseTime: "Thời gian phản hồi",
        responseTimeHistory: "Lịch sử thời gian phản hồi",
        requestRate: "Tỷ lệ yêu cầu",
        requests: "Yêu cầu",
        cpuUsage: "Sử dụng CPU",
        cpuMemory: "CPU & Bộ nhớ",
        memoryUsage: "Sử dụng bộ nhớ",
        diskUsage: "Sử dụng ổ đĩa",
        errorRate: "Tỷ lệ lỗi",
        averageMs: "Trung bình (ms)",
        p95: "p95",
        p99: "p99",
        storage: "Lưu trữ hệ thống",
        metrics: "Chỉ số",
        timeRange: "Khoảng thời gian",
        selectTimeRange: "Chọn khoảng thời gian",
        resourceUsage: "Sử dụng tài nguyên",
        endpointPerformance: "Hiệu suất theo endpoint",
        endpoint: "Endpoint",
        requestCount: "Số lượng yêu cầu",
        avgResponseTime: "Thời gian phản hồi TB",
        last6h: "6 giờ qua",
        last12h: "12 giờ qua",
        last24h: "24 giờ qua",
        last7d: "7 ngày qua",
        last30d: "30 ngày qua",
        requestsHistory: "Lịch sử yêu cầu"
      },
      
      stats: {
        totalUsers: "Tổng số người dùng",
        totalArticles: "Tổng số bài viết",
        totalCredits: "Tổng số tín dụng",
        totalRevenue: "Tổng doanh thu"
      }
    },
    
    common: {
      loading: "Đang tải...",
      error: "Đã xảy ra lỗi",
      appName: "SEO AI Writer",
      notConnected: "Chưa kết nối",
      loadingData: "Đang tải dữ liệu...",
      viewAll: "Xem tất cả",
      comparedToPreviousMonth: "so với tháng trước",
      tagline: "Nền tảng tạo bài viết SEO bằng AI cho người Việt",
      close: "Đóng",
      create: "Tạo mới",
      manage: "Quản lý",
      openMenu: "Mở menu",
      email: "Email",
      username: "Tên đăng nhập",
      name: "Tên",
      language: "Ngôn ngữ",
      search: "Tìm kiếm",
      filter: "Lọc",
      status: "Trạng thái",
      actions: "Hành động",
      edit: "Sửa",
      delete: "Xóa",
      cancel: "Hủy",
      save: "Lưu",
      submit: "Gửi",
      back: "Quay lại",
      next: "Tiếp theo",
      previous: "Trước",
      extracting: "Đang trích xuất...",
      extractedContent: "Nội dung đã trích xuất",
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      confirm: "Xác nhận",
      success: "Thành công",
      failed: "Thất bại",
      yes: "Có",
      no: "Không",
      change: "Thay đổi",
      update: "Cập nhật",
      addNew: "Thêm mới",
      details: "Chi tiết",
      warning: "Cảnh báo",
      information: "Thông tin",
      role: "Vai trò",
      password: "Mật khẩu",
      title: "Tiêu đề",
      description: "Mô tả",
      content: "Nội dung",
      date: "Ngày",
      time: "Thời gian",
      amount: "Số lượng",
      price: "Giá",
      total: "Tổng cộng",
      settings: "Cài đặt",
      account: "Tài khoản",
      profile: "Hồ sơ",
      logout: "Đăng xuất",
      login: "Đăng nhập",
      register: "Đăng ký",
      forgotPassword: "Quên mật khẩu",
      resetPassword: "Đặt lại mật khẩu",
      confirmNewPassword: "Xác nhận mật khẩu mới",
      verifyEmail: "Xác minh email",
      resendVerification: "Gửi lại email xác minh",
      verificationSent: "Email xác minh đã được gửi",
      verificationSuccess: "Xác minh thành công",
      loginRequired: "Vui lòng đăng nhập để tiếp tục",
      or: "Hoặc",
      generating: "Đang tạo...",
      
      apiKeys: {
        title: "API Keys",
        description: "Quản lý API Keys"
      },
      
      mascot: {
        dashboard: {
          welcomeTitle: "Xin chào!",
          welcomeTip: "Chào mừng bạn đến với SEO AI Writer! Đây là nơi bạn có thể xem tổng quan về tài khoản của mình.",
          creditsTitle: "Tín dụng",
          creditsTip: "Số tín dụng hiển thị ở bảng điều khiển cho biết bạn có thể tạo bao nhiêu bài viết mới.",
          articlesTitle: "Bài viết của bạn",
          articlesTip: "Bạn có thể xem các bài viết gần đây của mình tại đây và nhấp vào để chỉnh sửa hoặc xuất bản."
        },
        contentCreation: {
          welcomeTitle: "Bắt đầu tạo nội dung!",
          welcomeTip: "Hãy điền đầy đủ thông tin để tạo bài viết SEO chất lượng cao.",
          tipsTitle: "Mẹo tạo nội dung",
          tipsList: "Sử dụng từ khóa chính xác, chọn giọng điệu phù hợp với đối tượng, và cung cấp mô tả chi tiết để có kết quả tốt nhất.",
          creditsTitle: "Sử dụng tín dụng",
          creditsTip: "Mỗi bài viết sẽ sử dụng từ 1-3 tín dụng tùy thuộc vào độ dài bạn chọn."
        },
        articles: {
          welcomeTitle: "Bài viết của bạn",
          welcomeTip: "Đây là nơi bạn có thể quản lý tất cả bài viết đã tạo.",
          publishTitle: "Xuất bản bài viết",
          publishTip: "Bạn có thể xuất bản bài viết lên WordPress hoặc mạng xã hội sau khi đã kết nối tài khoản."
        },
        connections: {
          welcomeTitle: "Kết nối tài khoản",
          welcomeTip: "Kết nối WordPress và các mạng xã hội để xuất bản bài viết trực tiếp.",
          wordpressTitle: "WordPress",
          wordpressTip: "Để kết nối WordPress, bạn cần URL trang web, tên người dùng và Application Password."
        },
        credits: {
          welcomeTitle: "Quản lý tín dụng",
          welcomeTip: "Mua thêm tín dụng để tiếp tục tạo nội dung chất lượng cao.",
          usageTitle: "Sử dụng tín dụng",
          usageTip: "Tín dụng được sử dụng khi tạo nội dung mới và không thể hoàn lại."
        }
      }
    },
    
    auth: {
      login: {
        title: "Đăng nhập",
        username: "Tên đăng nhập hoặc Email",
        password: "Mật khẩu",
        rememberMe: "Ghi nhớ đăng nhập",
        forgotPassword: "Quên mật khẩu?",
        submit: "Đăng nhập",
        switchToRegister: "Chưa có tài khoản? Đăng ký ngay",
        orContinueWith: "Hoặc đăng nhập với"
      },
      register: {
        title: "Đăng ký",
        name: "Họ tên",
        email: "Email",
        password: "Mật khẩu",
        confirmPassword: "Xác nhận mật khẩu",
        termsAgree: "Tôi đồng ý với",
        terms: "Điều khoản dịch vụ",
        and: "và",
        privacy: "Chính sách bảo mật",
        submit: "Đăng ký",
        switchToLogin: "Đã có tài khoản? Đăng nhập"
      }
    },
    
    nav: {
      features: "Tính năng",
      pricing: "Bảng giá",
      faq: "Hỏi đáp",
      contact: "Liên hệ",
      dashboard: "Bảng điều khiển",
      login: "Đăng nhập",
      register: "Đăng ký"
    },
    
    authPage: {
      highlights: {
        seo: "Tạo nội dung chuẩn SEO chỉ trong vài phút",
        integration: "Tích hợp đa nền tảng: WordPress, social media",
        credits: "Hệ thống credits linh hoạt, chi phí tối ưu"
      }
    },
    
    landing: {
      hero: {
        badge: "Công nghệ AI tiên tiến",
        title: "Tạo bài viết SEO chất lượng cao tức thì",
        subtitle: "Sử dụng trí tuệ nhân tạo để tạo ra nội dung hấp dẫn, tối ưu cho SEO một cách nhanh chóng và hiệu quả.",
        tryFree: "Dùng thử miễn phí",
        viewDemo: "Xem demo",
        features: {
          aiContent: {
            title: "Nội dung AI",
            description: "Tạo nội dung SEO tự động với AI tiên tiến"
          },
          multilingual: {
            title: "Đa ngôn ngữ",
            description: "Hỗ trợ tiếng Việt và nhiều ngôn ngữ"
          },
          integration: {
            title: "Tích hợp",
            description: "Kết nối WordPress, Facebook, TikTok"
          },
          analytics: {
            title: "Phân tích",
            description: "Theo dõi hiệu suất và tối ưu nội dung"
          }
        },
        reviews: {
          from: "từ",
          customers: "khách hàng",
          verified: "Đã xác minh"
        },
        callouts: {
          seoOptimization: {
            title: "AI tự động tối ưu SEO",
            description: "Phân tích từ khóa và tối ưu nội dung"
          },
          vietnameseSupport: {
            title: "Hỗ trợ tiếng Việt",
            description: "Nội dung chất lượng cao bằng tiếng Việt"
          }
        }
      },
      features: {
        title: "Tính năng nổi bật",
        subtitle: "Khám phá những công cụ mạnh mẽ giúp tạo nội dung SEO hiệu quả",
        powerfulFeatures: "Tính năng mạnh mẽ",
        benefits: "Lợi ích nổi bật",
        description: "Công cụ toàn diện giúp bạn tạo, tối ưu và xuất bản nội dung chất lượng cao trên mọi nền tảng",
        aiContent: {
          benefit1: "Tiết kiệm thời gian soạn thảo",
          benefit2: "Tăng chất lượng nội dung",
          benefit3: "Tự động đề xuất cải thiện"
        },
        seoOptimization: {
          benefit1: "Cải thiện thứ hạng trên Google",
          benefit2: "Phân tích đối thủ cạnh tranh",
          benefit3: "Đề xuất từ khóa tối ưu"
        },
        platformIntegration: {
          benefit1: "Xuất bản với 1 click",
          benefit2: "Quản lý nội dung tập trung",
          benefit3: "Phân tích hiệu suất đăng bài"
        },
        ai: {
          title: "Nội dung AI",
          description: "Tạo nội dung SEO tự động với AI tiên tiến đội ngũ AI tiên tiến"
        },
        seo: {
          title: "Đa ngôn ngữ",
          description: "Hỗ trợ tiếng Việt và nhiều ngôn ngữ"
        },
        integration: {
          title: "Tích hợp",
          description: "Kết nối WordPress, Facebook, TikTok"
        },
        analysis: {
          title: "Phân tích",
          description: "Theo dõi hiệu suất và tối ưu nội dung"
        },
        categories: {
          content: {
            title: "Tạo nội dung",
            blog: {
              title: "Bài viết blog",
              description: "Tạo bài viết blog chuyên nghiệp với cấu trúc tối ưu SEO"
            },
            social: {
              title: "Nội dung mạng xã hội",
              description: "Tạo nội dung hấp dẫn cho Facebook, Instagram và TikTok"
            },
            email: {
              title: "Email marketing",
              description: "Tạo email chiến dịch chuyên nghiệp với tỷ lệ mở cao"
            }
          },
          analytics: {
            title: "Tối ưu & Phân tích",
            keywords: {
              title: "Nghiên cứu từ khóa",
              description: "Phân tích và đề xuất từ khóa có tiềm năng chuyển đổi cao"
            },
            performance: {
              title: "Phân tích hiệu suất",
              description: "Theo dõi và phân tích hiệu quả của nội dung theo thời gian thực"
            },
            technical: {
              title: "Tối ưu kỹ thuật",
              description: "Tự động tối ưu cấu trúc và thẻ meta để tăng điểm SEO kỹ thuật"
            }
          },
          management: {
            title: "Quản lý & Xuất bản",
            templates: {
              title: "Thư viện mẫu",
              description: "Truy cập thư viện đa dạng mẫu nội dung chuyên nghiệp"
            },
            multilingual: {
              title: "Hỗ trợ đa ngôn ngữ",
              description: "Tạo và tối ưu nội dung cho nhiều thị trường ngôn ngữ khác nhau"
            },
            dashboard: {
              title: "Bảng điều khiển",
              description: "Quản lý tất cả nội dung và lịch xuất bản từ một giao diện"
            }
          }
        },
        items: [
          {
            title: "Sáng tạo nội dung thông minh",
            description: "Tạo bài viết chất lượng cao với sự hỗ trợ của AI tiên tiến."
          },
          {
            title: "Tối ưu hóa từ khóa",
            description: "Phân tích và tối ưu từ khóa tự động để cải thiện thứ hạng tìm kiếm."
          },
          {
            title: "Đa dạng nền tảng xuất bản",
            description: "Xuất bản trực tiếp sang WordPress hoặc mạng xã hội chỉ với một cú nhấp chuột."
          }
        ]
      },
      pricing: {
        title: "Bảng giá",
        subtitle: "Chọn gói phù hợp với nhu cầu của bạn",
        creditPlans: "Gói credits",
        storagePlans: "Gói lưu trữ",
        popular: "Phổ biến nhất",
        subscribe: "Đăng ký",
        packages: {
          basic: "Gói Cơ Bản",
          advanced: "Gói Nâng Cao",
          professional: "Gói Chuyên Nghiệp",
          storageBasic: "Gói Lưu Trữ Cơ Bản",
          storageBusiness: "Gói Lưu Trữ Doanh Nghiệp",
          storageEnterprise: "Gói Lưu Trữ Doanh Nghiệp+"
        },
        features: {
          credits: "credits",
          wordsPerCredit: "từ/credit",
          wordPress: "Tích hợp WordPress",
          seoOptimization: "Tối ưu SEO",
          support: "Hỗ trợ",
          supportEmail: "Email",
          supportPriority: "Ưu tiên",
          support247: "24/7",
          saving: "Tiết kiệm",
          maxArticles: "bài viết tối đa",
          storage: "dung lượng lưu trữ",
          backup: "Sao lưu",
          wpConnections: "kết nối WordPress",
          socialConnect: "Kết nối mạng xã hội",
          apiAccess: "Truy cập API"
        },
        buyNow: "Mua ngay",
        guarantee: "Cam kết hoàn tiền trong 30 ngày",
        contactUs: "Liên hệ với chúng tôi",
        badge: "Bảng giá linh hoạt",
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
            question: "SEO AI Writer giúp tạo nội dung như thế nào?",
            answer: "SEO AI Writer sử dụng công nghệ AI tiên tiến để phân tích từ khóa, nghiên cứu chủ đề và tạo ra nội dung chất lượng cao đã được tối ưu hóa cho SEO."
          },
          {
            question: "Tôi có thể tạo bao nhiêu bài viết mỗi tháng?",
            answer: "Điều này phụ thuộc vào gói dịch vụ bạn đăng ký. Mỗi gói sẽ cung cấp một số lượng credits nhất định, bạn có thể sử dụng để tạo nội dung. Một bài viết thường tiêu thụ từ 10-50 credits tùy thuộc vào độ dài và độ phức tạp."
          },
          {
            question: "Nội dung được tạo ra có phải là nội dung duy nhất không?",
            answer: "Có, mọi nội dung được tạo bởi SEO AI Writer đều là duy nhất và được thiết kế để vượt qua các công cụ kiểm tra đạo văn. Hệ thống của chúng tôi liên tục học hỏi và cập nhật để tạo ra nội dung chất lượng cao nhất."
          },
          {
            question: "Tôi có thể tích hợp với WordPress của mình không?",
            answer: "Có, SEO AI Writer cung cấp tích hợp liền mạch với WordPress, cho phép bạn xuất bản nội dung trực tiếp lên trang web của mình chỉ với một cú nhấp chuột."
          },
          {
            question: "Dịch vụ của bạn có hỗ trợ ngôn ngữ nào?",
            answer: "Hiện tại, chúng tôi hỗ trợ tiếng Việt và tiếng Anh. Chúng tôi đang làm việc để mở rộng danh sách ngôn ngữ được hỗ trợ trong tương lai gần."
          }
        ]
      },
      contact: {
        title: "Liên hệ với chúng tôi",
        subtitle: "Chúng tôi luôn sẵn sàng giúp đỡ bạn",
        form: {
          name: "Họ tên",
          email: "Email",
          subject: "Tiêu đề",
          message: "Tin nhắn",
          send: "Gửi"
        }
      },
      footer: {
        description: "Nền tảng tạo nội dung SEO tiên tiến được hỗ trợ bởi AI giúp bạn tạo bài viết chất lượng cao nhanh chóng.",
        copyright: "© 2025 SEO AI Writer. Tất cả quyền được bảo lưu.",
        links: {
          product: "Sản phẩm",
          createSeoContent: "Tạo nội dung SEO",
          wordpressConnect: "Kết nối WordPress",
          socialShare: "Chia sẻ mạng xã hội",
          seoAnalysis: "Phân tích SEO",
          
          company: "Công ty",
          about: "Về chúng tôi",
          blog: "Blog",
          partners: "Đối tác",
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
      createContent: "Tạo nội dung",
      plans: {
        currentPlan: "Gói Dịch Vụ Hiện Tại",
        creditPackages: "Gói Tín Dụng",
        storagePackages: "Gói Lưu Trữ",
        expiresOn: "Hết hạn vào",
        upgrade: "Nâng cấp",
        renew: "Gia hạn"
      },
      connections: "Kết nối",
      settings: "Cài đặt",
      apiKeys: "API Keys",
      logout: "Đăng xuất",
      
      navigationItems: {
        dashboard: "Bảng điều khiển",
        createContent: "Tạo nội dung",
        myArticles: "Bài viết của tôi",
        credits: "Tín dụng",
        plans: "Gói dịch vụ",
        connections: "Kết nối",
        settings: "Cài đặt"
      },
      
      stats: {
        creditsLeft: "Số tín dụng còn lại",
        credits: "tín dụng",
        articlesCreated: "Bài viết đã tạo",
        imagesCreated: "Hình ảnh đã tạo",
        storageUsed: "Dung lượng sử dụng",
        recentArticles: "Bài viết gần đây",
        connectionsSection: "Kết nối",
        manageConnections: "Quản lý kết nối",
        articleTitle: "Tiêu đề bài viết",
        dateCreated: "Ngày tạo",
        status: "Trạng thái",
        keywords: "Từ khóa",
        actions: "Thao tác",
        buyMoreCredits: "Mua thêm tín dụng",
        viewMyArticles: "Xem bài viết của tôi",
        viewImageLibrary: "Xem thư viện hình ảnh"
      },
      
      articles: {
        search: "Tìm kiếm bài viết",
        filter: "Lọc bài viết",
        newArticle: "Tạo bài viết mới",
        statuses: {
          all: "Tất cả trạng thái",
          draft: "Bản nháp",
          published: "Đã xuất bản",
          wordpress: "WordPress",
          facebook: "Facebook",
          tiktok: "TikTok",
          twitter: "Twitter"
        },
        columns: {
          title: "Tiêu đề",
          createdAt: "Ngày tạo",
          status: "Trạng thái",
          keywords: "Từ khóa",
          actions: "Thao tác"
        }
      },

      create: {
        title: "Tạo nội dung",
        subtitle: "Tạo bài viết chuẩn SEO với công nghệ AI",
        socialContent: {
          title: "Tạo Nội Dung Mạng Xã Hội",
          subtitle: "Tạo nội dung tối ưu cho nhiều nền tảng social media",
          steps: {
            extraction: {
              title: "Trích xuất",
              description: "Lấy ý chính từ bài viết"
            },
            generation: {
              title: "Tạo nội dung",
              description: "Tạo post cho từng nền tảng"
            },
            images: {
              title: "Hoàn thành",
              description: "Chọn hoặc tạo hình ảnh"
            },
            preview: {
              title: "Xem trước",
              description: "Preview giao diện social media"
            },
            publish: {
              title: "Lưu & Đăng",
              description: "Hoàn tất và xuất bản"
            }
          },
          step1: {
            title: "Bước 1: Trích xuất nội dung",
            contentSource: "Nguồn nội dung",
            fromArticle: "Từ bài viết có sẵn",
            manual: "Tự nhập mô tả",
            selectArticle: "Chọn bài viết",
            selectArticlePlaceholder: "Chọn một bài viết từ thư viện của bạn",
            referenceLink: "URL tham khảo (tùy chọn)",
            referencePlaceholder: "https://example.com/article",
            description: "Mô tả nội dung",
            descriptionPlaceholder: "Nhập mô tả ngắn gọn về nội dung bạn muốn tạo...",
            platforms: "Nền tảng mục tiêu",
            extractAndContinue: "Trích xuất ý chính",
            descriptionRequired: "Vui lòng nhập mô tả nội dung",
            platformRequired: "Vui lòng chọn ít nhất một nền tảng",
            articleRequired: "Vui lòng chọn một bài viết"
          },
          articleContent: "Nội dung bài viết",
          noContent: "Không có nội dung",
          generatedContent: "Nội dung được tạo",
          viewFullResponse: "Xem response đầy đủ (Debug)",
          referenceDescription: "Thêm link tham khảo để cung cấp thêm context cho AI",
          referenceHelp: "Nhập link bài viết để AI tham khảo phong cách và nội dung"
        },
        tabs: {
          keywords: "Từ khóa",
          outline: "Dàn ý",
          content: "Nội dung",
          knowledge: "Kiến thức",
          style: "Kiểu thức",
          format: "Định dạng",
          media: "Hình ảnh",
          links: "Liên kết"
        },
        keywords: {
          title: "Từ khóa cho bài viết",
          description: "Hệ thống sẽ ép các từ khóa này vào phần AI tạo. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết.",
          mainKeyword: "Từ khóa chính",
          mainKeywordPlaceholder: "Nhập từ khóa chính",
          secondaryKeyword: "Từ khóa phụ",
          secondaryKeywordPlaceholder: "Nhập từ khóa phụ",
          relatedKeyword: "Từ khóa liên quan",
          relatedKeywordPlaceholder: "Nhập từ khóa liên quan",
          addNew: "Thêm mới"
        },
        outline: {
          title: "Dàn ý bài viết",
          description: "Xây dựng cấu trúc nội dung bài viết của bạn bằng các tiêu đề có thứ bậc.",
          customizeStructure: "Tùy chỉnh cấu trúc bài viết",
          autoGenerateMessage: "Hệ thống sẽ tự động tạo dàn ý dựa trên từ khóa nếu bạn không cung cấp.",
          empty: "Chưa có mục nào trong dàn ý. Hãy thêm mục đầu tiên bên dưới.",
          headingPlaceholder: "Nhập tiêu đề mục",
          addStructure: "Thêm mục"
        },
        content: {
          title: "Nội dung cho bài viết",
          description: "Hệ thống sẽ tạo nội dung cho bài viết của bạn.",
          guide: "Hướng dẫn chi tiết",
          placeholder: "Nhập hướng dẫn chi tiết về nội dung bạn muốn tạo...",
          language: "Ngôn ngữ",
          selectLanguage: "Chọn ngôn ngữ",
          languages: {
            vietnamese: "Tiếng Việt",
            english: "Tiếng Anh"
          },
          languageHint: "Ngôn ngữ mà tất cả các bài viết sẽ được viết.",
          country: "Quốc gia",
          selectCountry: "Chọn quốc gia",
          countries: {
            vietnam: "Việt Nam",
            us: "Hoa Kỳ",
            global: "Toàn cầu"
          },
          countryHint: "Quốc gia mục tiêu mà nội dung sẽ tập trung hướng đến",
          voice: "Giọng nói",
          selectVoice: "Chọn giọng nói",
          voices: {
            neutral: "Trung lập"
          },
          voiceHint: "Ví dụ: vui vẻ, trung lập, học thuật",
          perspective: "Ngôi kể",
          selectPerspective: "Chọn ngôi kể",
          perspectives: {
            auto: "Tự động",
            first: "Ngôi thứ nhất (tôi, chúng tôi)",
            second: "Ngôi thứ hai (bạn)",
            third: "Ngôi thứ ba (anh ấy, cô ấy, họ)"
          },
          perspectiveHint: "Điều này sẽ ảnh hưởng đến các đại từ được sử dụng trong bài viết.",
          complexity: "Mức độ",
          selectComplexity: "Chọn mức độ",
          complexities: {
            auto: "Tự động",
            basic: "Cơ bản",
            intermediate: "Trung bình",
            advanced: "Nâng cao"
          },
          complexityHint: "Lựa chọn giọng văn phù hợp với ngữ cảnh bài viết."
        },
        format: {
          title: "Định dạng cho bài viết",
          description: "Hệ thống sẽ định dạng cho bài viết của bạn.",
          bold: "In đậm",
          boldDescription: "Chúng tôi sẽ in đậm những từ khóa quan trọng trong bài viết của bạn.",
          italic: "In nghiêng",
          italicDescription: "Chúng tôi sẽ sử dụng chữ in nghiêng để nhấn mạnh một cách tinh tế trong bài viết của bạn.",
          bulletPoints: "Liệt kê",
          bulletPointsDescription: "Nếu bạn đồng ý, tôi sẽ dùng tap liệt kê cho nội dung",
          addSectionHeadings: "Add Section Headings",
          addSectionHeadingsDescription: "Tự động thêm các tiêu đề để phân chia và vào bài viết"
        },
        media: {
          title: "Hình ảnh cho bài viết",
          description: "Quản lý cài đặt kích thước hình ảnh trong bài viết của bạn",
          imageSize: "Kích thước hình ảnh",
          imageSizes: {
            small: "Nhỏ (640×480)",
            medium: "Trung bình (1280×720)",
            large: "Lớn (1920×1080)"
          },
          autoGenerate: "Tạo hình ảnh tự động",
          autoGenerateDescription: "Tự động tạo hình ảnh phù hợp với nội dung bài viết bằng AI"
        },
        links: {
          title: "Liên kết cho bài viết",
          description: "Hệ thống sẽ tạo liên kết cho bài viết của bạn.",
          linkList: "Danh sách liên kết",
          keyword: "Từ khóa",
          link: "Liên kết", 
          addLink: "Thêm liên kết"
        },
        knowledge: {
          title: "Kiến thức chuyên môn",
          description: "Bổ sung các thông tin chuyên môn để làm giàu nội dung bài viết",
          webResearch: "Sử dụng nghiên cứu web",
          webResearchDescription: "Cho phép AI tìm kiếm thông tin trên web để bổ sung cho bài viết",
          refSources: "Nguồn tham khảo",
          refSourcesDescription: "Liệt kê các nguồn tham khảo sẽ được sử dụng (URL, tài liệu, ...)",
          aiModel: "Mô hình AI",
          aiModelDescription: "Chọn mô hình AI sẽ sử dụng để tạo nội dung",
          aiModelPlaceholder: "Chọn mô hình AI"
        },
        generateContent: "Tạo nội dung",
        form: {
          articleTitle: "Tiêu đề bài viết",
          contentType: "Loại nội dung",
          keywords: "Từ khóa",
          length: "Độ dài",
          tone: "Giọng điệu",
          prompt: "Hướng dẫn chi tiết",
          addHeadings: "Thêm tiêu đề phần",
          generate: "Tạo nội dung",
          reset: "Đặt lại",
          contentTypeOptions: {
            blog: "Bài Blog",
            product: "Nội dung sản phẩm",
            news: "Tin tức",
            social: "Mạng xã hội"
          },
          lengthOptions: {
            short: "Ngắn (300-500 từ)",
            medium: "Vừa (500-800 từ)",
            long: "Dài (800-1500 từ)",
            extraLong: "Rất dài (1500+ từ)"
          },
          toneOptions: {
            professional: "Chuyên nghiệp",
            conversational: "Trò chuyện",
            informative: "Thông tin",
            persuasive: "Thuyết phục",
            humorous: "Hài hước"
          }
        }
      },
      
      connectionTypes: {
        wordpress: {
          connected: "Đã kết nối"
        },
        social: {
          connected: "Đã kết nối"
        }
      },
      
      credits: {
        title: "Tín dụng",
        currentBalance: "Số dư hiện tại",
        history: "Lịch sử",
        buyCredits: "Mua tín dụng",
        date: "Ngày",
        description: "Mô tả",
        amount: "Số lượng",
        previous: "Trước",
        next: "Tiếp theo",
        loading: "Đang tải...",
        loadingHistory: "Đang tải lịch sử giao dịch...",
        noTransactions: "Không tìm thấy giao dịch nào",
        creditHistory: "Lịch sử giao dịch tín dụng của bạn",
        page: "Trang",
        transactions: {
          contentGeneration: "Tạo nội dung",
          createdArticle: "Tạo bài viết:",
          purchase: "Mua",
          refund: "Hoàn tiền"
        }
      }
    }
  },
  
  en: {
    admin: {
      adminPanel: "Admin Panel",
      adminDashboard: "Admin Dashboard",
      dashboard: "Dashboard",
      users: "Users",
      articles: "Articles",
      plans: "Plans",
      payments: "Payments",
      performance: "Performance",
      integrations: "Integrations",
      
      usersManagement: {
        title: "Users Management",
        description: "View and manage all users in the system",
        username: "Username",
        email: "Email",
        fullName: "Full Name",
        role: "Role",
        status: "Status",
        password: "Password",
        passwordDescription: "Password must be at least 6 characters long",
        selectRole: "Select role",
        selectStatus: "Select status",
        roleUser: "User",
        roleAdmin: "Administrator",
        statusActive: "Active",
        statusInactive: "Inactive",
        statusSuspended: "Suspended",
        allUsers: "All Users",
        totalCount: "Total Count",
        users: "users",
        joinDate: "Join Date",
        noUsers: "No users found",
        adjustCredits: "Adjust credits",
        adjustCreditsForUser: "Adjust credits for user",
        currentCredits: "Current balance",
        adjustmentAmount: "Adjustment amount",
        adjustmentAmountDescription: "Enter a positive number to add credits, negative to subtract",
        adjustmentReason: "Adjustment reason",
        adjustmentReasonPlaceholder: "Example: Promotion, refund, error correction...",
        assignPlan: "Assign plan",
        assignPlanForUser: "Assign plan to user",
        selectPlan: "Select plan",
        selectPlanPlaceholder: "Select a plan",
        customDuration: "Custom duration (days)",
        customDurationDescription: "Leave empty to use the default duration of the plan"
      },
      articlesManagement: {
        title: "Articles Management",
        description: "View and manage all articles in the system",
        allArticles: "All Articles",
        totalCount: "Total Count",
        articles: "articles",
        search: "Search articles",
        author: "Author",
        status: "Status",
        createdAt: "Created At",
        updatedAt: "Updated At",
        allStatuses: "All Statuses",
        noArticles: "No articles found",
        delete: "Delete Article",
        edit: "Edit Article",
        view: "View Details"
      },
      history: "History",
      settings: "Settings",
      
      settingsPage: {
        title: "Settings",
        general: "General Settings",
        generalDescription: "Configure general application settings",
        siteName: "Site Name",
        siteDescription: "Site Description",
        contactEmail: "Contact Email",
        supportEmail: "Support Email",
        enableNewUsers: "Enable New Registrations",
        enableNewUsersDescription: "Allow new users to register accounts",
        enableArticleCreation: "Enable Article Creation",
        enableArticleCreationDescription: "Allow users to create new articles",
        enableAutoPublish: "Enable Auto-Publishing",
        enableAutoPublishDescription: "Allow automatic publishing of articles to connected channels",
        maintenanceMode: "Maintenance Mode",
        maintenanceModeDescription: "Activate maintenance mode, only admins can access",
        ai: "AI Settings",
        email: "Email Settings",
        api: "API Integration",
        webhook: "Webhook",
        system: "System",
        systemStatus: "System Status",
        version: "Version",
        database: "Database",
        lastBackup: "Last Backup",
        backupNow: "Backup Now",
        backingUp: "Backing up...",
        refreshSystemInfo: "Refresh System Info",
        systemLog: "System Log",
        systemInfoFooter: "System developed by SEO AI Writer Team. For support, please contact support@example.com",
        webhookDescription: "Configure webhook for n8n and other services",
        webhookSecret: "Webhook Secret",
        webhookSecretDescription: "Secret key to authenticate webhooks, starting with 'whsec_'",
        notificationWebhook: "n8n Notification Webhook",
        notificationWebhookDescription: "Webhook URL to receive system events notifications",
        availableWebhookEvents: "Available Webhook Events"
      },
      
      performanceMetrics: {
        title: "Performance Metrics",
        responseTime: "Response Time",
        responseTimeHistory: "Response Time History",
        requestRate: "Request Rate",
        requests: "Requests",
        cpuUsage: "CPU Usage",
        cpuMemory: "CPU & Memory",
        memoryUsage: "Memory Usage",
        diskUsage: "Disk Usage",
        errorRate: "Error Rate",
        averageMs: "Average (ms)",
        p95: "p95",
        p99: "p99",
        storage: "System Storage",
        metrics: "Metrics",
        timeRange: "Time Range",
        selectTimeRange: "Select time range",
        resourceUsage: "Resource Usage",
        endpointPerformance: "Endpoint Performance",
        endpoint: "Endpoint",
        requestCount: "Request Count",
        avgResponseTime: "Avg Response Time",
        last6h: "Last 6 hours",
        last12h: "Last 12 hours",
        last24h: "Last 24 hours",
        last7d: "Last 7 days",
        last30d: "Last 30 days",
        requestsHistory: "Requests History"
      },
      
      stats: {
        totalUsers: "Total Users",
        totalArticles: "Total Articles",
        totalCredits: "Total Credits",
        totalRevenue: "Total Revenue"
      }
    },
    
    common: {
      loading: "Loading...",
      error: "An error occurred",
      appName: "SEO AI Writer",
      notConnected: "Not connected",
      loadingData: "Loading data...",
      viewAll: "View all",
      comparedToPreviousMonth: "compared to previous month",
      tagline: "AI-powered SEO content platform",
      close: "Close",
      create: "Create",
      manage: "Manage",
      openMenu: "Open menu",
      email: "Email",
      username: "Username",
      name: "Name",
      language: "Language",
      search: "Search",
      filter: "Filter",
      status: "Status",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      submit: "Submit",
      back: "Back",
      next: "Next",
      previous: "Previous",
      extracting: "Extracting...",
      extractedContent: "Extracted Content",
      active: "Active",
      inactive: "Inactive",
      confirm: "Confirm",
      success: "Success",
      failed: "Failed",
      yes: "Yes",
      no: "No",
      change: "Change",
      update: "Update",
      addNew: "Add New",
      details: "Details",
      warning: "Warning",
      information: "Information",
      role: "Role",
      password: "Password",
      title: "Title",
      description: "Description",
      content: "Content",
      date: "Date",
      time: "Time",
      amount: "Amount",
      price: "Price",
      total: "Total",
      settings: "Settings",
      account: "Account",
      profile: "Profile",
      logout: "Logout",
      login: "Login",
      register: "Register",
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      confirmNewPassword: "Confirm New Password",
      verifyEmail: "Verify Email",
      resendVerification: "Resend Verification Email",
      verificationSent: "Verification email has been sent",
      verificationSuccess: "Verification successful",
      loginRequired: "Please login to continue",
      or: "Or",
      
      apiKeys: {
        title: "API Keys",
        description: "Manage API Keys"
      },
      
      mascot: {
        dashboard: {
          welcomeTitle: "Hello!",
          welcomeTip: "Welcome to SEO AI Writer! This is where you can view an overview of your account.",
          creditsTitle: "Credits",
          creditsTip: "The credits displayed on the dashboard show how many new articles you can create.",
          articlesTitle: "Your Articles",
          articlesTip: "You can view your recent articles here and click to edit or publish them."
        },
        contentCreation: {
          welcomeTitle: "Start creating content!",
          welcomeTip: "Fill in all the information to create high-quality SEO articles.",
          tipsTitle: "Content creation tips",
          tipsList: "Use exact keywords, choose a tone that suits your audience, and provide detailed descriptions for the best results.",
          creditsTitle: "Using credits",
          creditsTip: "Each article will use 1-3 credits depending on the length you choose."
        },
        articles: {
          welcomeTitle: "Your articles",
          welcomeTip: "This is where you can manage all your created articles.",
          publishTitle: "Publish articles",
          publishTip: "You can publish articles to WordPress or social media after connecting your accounts."
        },
        connections: {
          welcomeTitle: "Account connections",
          welcomeTip: "Connect WordPress and social media to publish articles directly.",
          wordpressTitle: "WordPress",
          wordpressTip: "To connect WordPress, you need the website URL, username, and Application Password."
        },
        credits: {
          welcomeTitle: "Manage credits",
          welcomeTip: "Buy more credits to continue creating high-quality content.",
          usageTitle: "Using credits",
          usageTip: "Credits are used when creating new content and cannot be refunded."
        }
      }
    },
    
    auth: {
      login: {
        title: "Login",
        username: "Username or Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        submit: "Login",
        switchToRegister: "Don't have an account? Register now",
        orContinueWith: "Or continue with"
      },
      register: {
        title: "Register",
        name: "Full Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        termsAgree: "I agree to the",
        terms: "Terms of Service",
        and: "and",
        privacy: "Privacy Policy",
        submit: "Register",
        switchToLogin: "Already have an account? Login"
      }
    },
    
    nav: {
      features: "Features",
      pricing: "Pricing",
      faq: "FAQ",
      contact: "Contact",
      dashboard: "Dashboard",
      login: "Login",
      register: "Register"
    },
    
    authPage: {
      highlights: {
        seo: "Create SEO-optimized content in minutes",
        integration: "Multi-platform integration: WordPress, social media",
        credits: "Flexible credit system, optimized cost"
      }
    },
    
    landing: {
      hero: {
        badge: "Advanced AI Technology",
        title: "Create High-Quality SEO Content Instantly",
        subtitle: "Use artificial intelligence to create engaging, SEO-optimized content quickly and efficiently.",
        tryFree: "Try for Free",
        viewDemo: "View Demo",
        features: {
          aiContent: {
            title: "AI Content",
            description: "Automatically create SEO content with advanced AI"
          },
          multilingual: {
            title: "Multilingual",
            description: "Support Vietnamese and multiple languages"
          },
          integration: {
            title: "Integration",
            description: "Connect WordPress, Facebook, TikTok"
          },
          analytics: {
            title: "Analytics",
            description: "Track performance and optimize content"
          }
        },
        reviews: {
          from: "from",
          customers: "customers",
          verified: "Verified"
        },
        callouts: {
          seoOptimization: {
            title: "AI Auto SEO Optimization",
            description: "Keyword analysis and content optimization"
          },
          vietnameseSupport: {
            title: "Vietnamese Support",
            description: "High-quality content in Vietnamese"
          }
        }
      },
      features: {
        title: "Key Features",
        subtitle: "Discover powerful tools to create effective SEO content",
        powerfulFeatures: "Powerful Features",
        benefits: "Key Benefits",
        description: "Comprehensive tools to help you create, optimize and publish high-quality content across all platforms",
        aiContent: {
          benefit1: "Save writing time",
          benefit2: "Improve content quality",
          benefit3: "Auto improvement suggestions"
        },
        seoOptimization: {
          benefit1: "Improve Google rankings",
          benefit2: "Analyze competitors",
          benefit3: "Optimize keyword suggestions"
        },
        platformIntegration: {
          benefit1: "Publish with 1 click",
          benefit2: "Centralized content management",
          benefit3: "Post performance analytics"
        },
        ai: {
          title: "AI Content",
          description: "Advanced AI system automatically analyzes and creates high-quality content with appropriate tone for every industry"
        },
        seo: {
          title: "Multilingual",
          description: "Support Vietnamese and multiple languages"
        },
        integration: {
          title: "Integration",
          description: "Connect with WordPress, Facebook, TikTok and other social channels seamlessly"
        },
        analysis: {
          title: "Analytics",
          description: "Track performance and optimize content effectively"
        },
        categories: {
          content: {
            title: "Content Creation",
            blog: {
              title: "Blog Articles",
              description: "Create professional blog posts with SEO-optimized structure"
            },
            social: {
              title: "Social Media Content",
              description: "Create engaging content for Facebook, Instagram and TikTok"
            },
            email: {
              title: "Email Marketing",
              description: "Create professional email campaigns with high open rates"
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
        popular: "Most Popular",
        subscribe: "Subscribe",
        packages: {
          basic: "Basic Plan",
          advanced: "Advanced Plan",
          professional: "Professional Plan",
          storageBasic: "Basic Storage Plan",
          storageBusiness: "Business Storage Plan",
          storageEnterprise: "Enterprise Storage Plan"
        },
        features: {
          credits: "credits",
          wordsPerCredit: "words/credit",
          wordPress: "WordPress Integration",
          seoOptimization: "SEO Optimization",
          support: "Support",
          supportEmail: "Email",
          supportPriority: "Priority",
          support247: "24/7",
          saving: "Saving",
          maxArticles: "maximum articles",
          storage: "storage space",
          backup: "Backup",
          wpConnections: "WordPress connections",
          socialConnect: "Social media connections",
          apiAccess: "API Access"
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
      contact: {
        title: "Contact Us",
        subtitle: "We're here to help you",
        form: {
          name: "Full Name",
          email: "Email",
          subject: "Subject",
          message: "Message",
          send: "Send"
        }
      },
      footer: {
        description: "Advanced AI-powered SEO content platform that helps you create high-quality articles quickly.",
        copyright: "© 2025 SEO AI Writer. All rights reserved.",
        links: {
          product: "Product",
          createSeoContent: "Create SEO Content",
          wordpressConnect: "WordPress Connect",
          socialShare: "Social Share",
          seoAnalysis: "SEO Analysis",
          
          company: "Company",
          about: "About Us",
          blog: "Blog",
          partners: "Partners",
          careers: "Careers",
          
          support: "Support",
          helpCenter: "Help Center",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          contact: "Contact"
        }
      }
    },
    
    dashboard: {
      title: "Dashboard",
      overview: "Overview",
      insights: "Insights",
      myArticles: "My Articles",
      createContent: "Create Content",
      plans: "Plans",
      connections: "Connections",
      credits: "Credits",
      settings: "Settings", 
      apiKeys: "API Keys",
      logout: "Logout",
      
      articles: {
        search: "Search articles",
        filter: "Filter articles",
        newArticle: "Create new article",
        statuses: {
          all: "All statuses",
          draft: "Draft",
          published: "Published",
          wordpress: "WordPress",
          facebook: "Facebook",
          tiktok: "TikTok",
          twitter: "Twitter"
        },
        columns: {
          title: "Title",
          createdAt: "Created At",
          status: "Status",
          keywords: "Keywords",
          actions: "Actions"
        }
      },
      
      create: {
        title: "Create Content",
        subtitle: "Create SEO-optimized content with AI",
        socialContent: {
          title: "Create Social Media Content",
          subtitle: "Create optimized content for multiple social media platforms",
          steps: {
            extraction: {
              title: "Extract",
              description: "Extract key points from article"
            },
            generation: {
              title: "Generate",
              description: "Create posts for each platform"
            },
            images: {
              title: "Complete",
              description: "Select or create images"
            },
            preview: {
              title: "Preview",
              description: "Preview social media interface"
            },
            publish: {
              title: "Save & Publish",
              description: "Complete and publish"
            }
          },
          step1: {
            title: "Step 1: Content Extraction",
            contentSource: "Content Source",
            fromArticle: "From Existing Article",
            manual: "Manual Input",
            selectArticle: "Select Article",
            selectArticlePlaceholder: "Choose an article from your library",
            referenceLink: "Reference URL (optional)",
            referencePlaceholder: "https://example.com/article",
            description: "Content Description",
            descriptionPlaceholder: "Enter a brief description of the content you want to create...",
            platforms: "Target Platforms",
            extractAndContinue: "Extract Content",
            descriptionRequired: "Please enter content description",
            platformRequired: "Please select at least one platform",
            articleRequired: "Please select an article"
          },
          articleContent: "Article Content",
          noContent: "No content",
          generatedContent: "Generated Content",
          viewFullResponse: "View Full Response (Debug)",
          referenceDescription: "Add reference link to provide additional context for AI",
          referenceHelp: "Enter article link for AI to reference style and content"
        },
        tabs: {
          keywords: "Keywords",
          outline: "Outline",
          content: "Content",
          style: "Style",
          format: "Format",
          media: "Media",
          links: "Links",
          knowledge: "Knowledge"
        },
        keywords: {
          title: "Keywords for article",
          description: "The system will incorporate these keywords in the AI generation. Make sure the keywords are related to the topic of the article.",
          mainKeyword: "Main keyword",
          mainKeywordPlaceholder: "Enter main keyword",
          secondaryKeyword: "Secondary keyword",
          secondaryKeywordPlaceholder: "Enter secondary keyword",
          relatedKeyword: "Related keyword",
          relatedKeywordPlaceholder: "Enter related keyword",
          addNew: "Add new"
        },
        outline: {
          title: "Article Outline",
          description: "Build your content structure with hierarchical headings.",
          customizeStructure: "Customize Article Structure",
          autoGenerateMessage: "The system will automatically generate an outline based on keywords if you don't provide one.",
          empty: "No outline items yet. Add your first heading below.",
          headingPlaceholder: "Enter heading text",
          addStructure: "Add Heading"
        },
        content: {
          title: "Article Content",
          description: "The system will generate content for your article.",
          guide: "Detailed Instructions",
          placeholder: "Enter detailed instructions about the content you want to generate...",
          language: "Language",
          selectLanguage: "Select language",
          languages: {
            vietnamese: "Vietnamese",
            english: "English"
          },
          languageHint: "Language in which all articles will be written.",
          country: "Country",
          selectCountry: "Select country",
          countries: {
            vietnam: "Vietnam",
            us: "United States",
            global: "Global"
          },
          countryHint: "Target country that the content will focus on",
          voice: "Voice",
          selectVoice: "Select voice",
          voices: {
            neutral: "Neutral"
          },
          voiceHint: "E.g.: cheerful, neutral, academic",
          perspective: "Perspective",
          selectPerspective: "Select perspective",
          perspectives: {
            auto: "Automatic",
            first: "First person (I, we)",
            second: "Second person (you)",
            third: "Third person (he, she, they)"
          },
          perspectiveHint: "This will affect the pronouns used in the article.",
          complexity: "Complexity",
          selectComplexity: "Select complexity",
          complexities: {
            auto: "Automatic",
            basic: "Basic",
            intermediate: "Intermediate",
            advanced: "Advanced"
          },
          complexityHint: "Choose appropriate tone for your article context."
        },
        format: {
          title: "Article Format",
          description: "The system will format your article.",
          bold: "Bold",
          boldDescription: "We will bold important keywords in your article.",
          italic: "Italic", 
          italicDescription: "Use italics to emphasize important text in your article.",
          bulletPoints: "Bullet Points",
          bulletPointsDescription: "If enabled, your text content will include bullet points.",
          addSectionHeadings: "Add Section Headings",
          addSectionHeadingsDescription: "Automatically add section titles to organize your article."
        },
        media: {
          title: "Images for Article",
          description: "Manage image size settings in your article",
          imageSize: "Image Size",
          imageSizes: {
            small: "Small (640×480)",
            medium: "Medium (1280×720)", 
            large: "Large (1920×1080)"
          },
          autoGenerate: "Auto Generate Images",
          autoGenerateDescription: "Automatically generate images that match your article content using AI"
        },
        links: {
          title: "Links for Article", 
          description: "The system will create links for your article.",
          linkList: "Link List",
          keyword: "Keyword",
          link: "Link",
          addLink: "Add Link"
        },
        knowledge: {
          title: "Professional Knowledge",
          description: "Add professional information to enrich article content",
          webResearch: "Use Web Research",
          webResearchDescription: "Allow AI to search information on the web to supplement the article",
          refSources: "Reference Sources",
          refSourcesDescription: "List reference sources to be used (URL, documents, ...)",
          aiModel: "AI Model",
          aiModelDescription: "Choose AI model to use for content creation",
          aiModelPlaceholder: "Choose AI model"
        },
        generateContent: "Generate Content",
        form: {
          articleTitle: "Article Title",
          contentType: "Content Type",
          keywords: "Keywords",
          length: "Length",
          tone: "Tone",
          prompt: "Detailed Instructions",
          addHeadings: "Add Section Headings",
          generate: "Generate Content",
          reset: "Reset",
          contentTypeOptions: {
            blog: "Blog Post",
            product: "Product Content",
            news: "News Article",
            social: "Social Media"
          },
          lengthOptions: {
            short: "Short (300-500 words)",
            medium: "Medium (500-800 words)",
            long: "Long (800-1500 words)",
            extraLong: "Extra Long (1500+ words)"
          },
          toneOptions: {
            professional: "Professional",
            conversational: "Conversational",
            informative: "Informative",
            persuasive: "Persuasive",
            humorous: "Humorous"
          }
        }
      },
      
      navigationItems: {
        dashboard: "Dashboard",
        createContent: "Create Content",
        myArticles: "My Articles",
        credits: "Credits",
        plans: "Plans",
        connections: "Connections",
        settings: "Settings"
      },
      
      stats: {
        creditsLeft: "Credits Left",
        credits: "credits",
        articlesCreated: "Articles Created",
        imagesCreated: "Images Created",
        storageUsed: "Storage Used",
        recentArticles: "Recent Articles",
        connectionsSection: "Connections",
        manageConnections: "Manage Connections",
        articleTitle: "Article Title",
        dateCreated: "Date Created",
        status: "Status",
        keywords: "Keywords",
        actions: "Actions",
        buyMoreCredits: "Buy More Credits",
        viewMyArticles: "View My Articles",
        viewImageLibrary: "View Image Library"
      },
      
      connectionTypes: {
        wordpress: {
          connected: "Connected"
        },
        social: {
          connected: "Connected"
        }
      }
    },
    
    socialContent: {
      step1: {
        title: "Step 1: Content Extraction",
        contentSource: "Content Source",
        manualInput: "Manual Input",
        existingArticle: "From Existing Article",
        description: "Content Description",
        descriptionPlaceholder: "Enter a brief description of the content you want to create...",
        referenceUrl: "Reference URL (optional)",
        urlPlaceholder: "https://example.com/article",
        targetPlatforms: "Target Platforms",
        extractContent: "Extract Content"
      }
    }
  }
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'vi' as Language,
  setLanguage: () => {},
  t: (key: string) => key
});

// Export context for use in hooks
export { LanguageContext };

// Export the provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    console.log('[LanguageProvider] Initial language from localStorage:', savedLanguage);
    return savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi') 
      ? savedLanguage 
      : 'vi';
  });

  // Effect to update language preference
  useEffect(() => {
    console.log('[LanguageProvider] Language changed to:', language);
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    console.log('[LanguageProvider] setLanguage called with:', lang);
    setLanguage(lang);
  };

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];

      for (const k of keys) {
        if (value === undefined || value[k] === undefined) {
          // Nếu không tìm thấy, trả về phần cuối của key để dễ đọc
          return keys[keys.length - 1].replace(/([A-Z])/g, ' $1').trim();
        }
        value = value[k];
      }

      if (typeof value === 'string') {
        return value;
      } else {
        // Nếu value không phải string (có thể là object), trả về phần cuối của key
        return keys[keys.length - 1].replace(/([A-Z])/g, ' $1').trim();
      }
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      // Trả về phần cuối của key với định dạng cải thiện khi có lỗi
      const lastKey = key.split('.').pop() || '';
      return lastKey.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};