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
        noUsers: "Không tìm thấy người dùng nào"
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
        viewDemo: "Xem demo"
      },
      features: {
        title: "Tính năng nổi bật",
        subtitle: "Khám phá những công cụ mạnh mẽ giúp tạo nội dung SEO hiệu quả",
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
        contactUs: "Liên hệ với chúng tôi"
      },
      faq: {
        title: "Câu hỏi thường gặp",
        subtitle: "Những câu hỏi được hỏi nhiều nhất",
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
      }
    },
    
    dashboard: {
      title: "Bảng điều khiển",
      overview: "Tổng quan",
      insights: "Thông tin chi tiết",
      myArticles: "Bài viết của tôi",
      createContent: "Tạo nội dung",
      plans: "Gói dịch vụ",
      connections: "Kết nối",
      credits: "Tín dụng",
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
        articlesCreated: "Bài viết đã tạo",
        storageUsed: "Dung lượng sử dụng",
        recentArticles: "Bài viết gần đây",
        connectionsSection: "Kết nối",
        manageConnections: "Quản lý kết nối",
        articleTitle: "Tiêu đề bài viết",
        dateCreated: "Ngày tạo",
        status: "Trạng thái",
        keywords: "Từ khóa",
        actions: "Thao tác",
        buyMoreCredits: "Mua thêm tín dụng"
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
        tabs: {
          keywords: "Từ khóa",
          outline: "Dàn ý",
          content: "Nội dung",
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
        media: {
          title: "Hình ảnh",
          description: "Thêm hình ảnh minh họa cho bài viết của bạn",
          comingSoon: "Sắp ra mắt"
        },
        links: {
          title: "Liên kết",
          description: "Thêm các liên kết ngoài và liên kết nội bộ",
          comingSoon: "Sắp ra mắt"
        },
        knowledge: {
          title: "Kiến thức",
          description: "Cài đặt nguồn tham khảo và mô hình AI",
          webResearch: "Nghiên cứu web",
          webResearchDescription: "Cho phép AI tìm kiếm và sử dụng thông tin từ internet",
          refSources: "Nguồn tham khảo",
          aiModel: "Mô hình AI"
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
        noUsers: "No users found"
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
        viewDemo: "View Demo"
      },
      features: {
        title: "Key Features",
        subtitle: "Discover powerful tools to create effective SEO content",
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
        contactUs: "Contact Us"
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
        media: {
          title: "Images",
          description: "Add illustrative images to your article",
          comingSoon: "Coming Soon"
        },
        links: {
          title: "Links",
          description: "Add external and internal links",
          comingSoon: "Coming Soon"
        },
        knowledge: {
          title: "Knowledge",
          description: "Configure reference sources and AI model",
          webResearch: "Web Research",
          webResearchDescription: "Allow AI to search and use information from the internet",
          refSources: "Reference Sources",
          aiModel: "AI Model"
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
        articlesCreated: "Articles Created",
        storageUsed: "Storage Used",
        recentArticles: "Recent Articles",
        connectionsSection: "Connections",
        manageConnections: "Manage Connections",
        articleTitle: "Article Title",
        dateCreated: "Date Created",
        status: "Status",
        keywords: "Keywords",
        actions: "Actions",
        buyMoreCredits: "Buy More Credits"
      },
      
      connectionTypes: {
        wordpress: {
          connected: "Connected"
        },
        social: {
          connected: "Connected"
        }
      }
    }
  }
};

const defaultLanguage: Language = 'vi';

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key
});

// Export context for use in hooks
export { LanguageContext };

// Export the provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi') 
      ? savedLanguage 
      : defaultLanguage;
  });

  // Effect to update language preference
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];

      for (const k of keys) {
        if (value === undefined) return key;
        value = value[k];
      }

      if (typeof value === 'string') {
        return value;
      }
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};