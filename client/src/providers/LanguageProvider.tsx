import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'vi' | 'en';
export type TranslationKey = string;

// Define translations type structure
type TranslationData = {
  [key: string]: string | TranslationData;
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
const translations = {
  vi: {
    common: {
      loading: "Đang tải...",
      error: "Đã xảy ra lỗi",
      appName: "SEO AI Writer",
      notConnected: "Chưa kết nối",
      loadingData: "Đang tải dữ liệu...",
      viewAll: "Xem tất cả",
      comparedToPreviousMonth: "so với tháng trước",
      tagline: "Nền tảng tạo bài viết SEO bằng AI cho người Việt",
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
          usageTip: "Tín dụng được sử dụng khi tạo nội dung mới và không có thời hạn sử dụng."
        },
        plans: {
          welcomeTitle: "Gói đăng ký",
          welcomeTip: "Nâng cấp lên gói cao hơn để nhận nhiều tín dụng và dung lượng lưu trữ hơn.",
          featuresTitle: "Tính năng",
          featuresTip: "Các gói cao cấp bao gồm thêm tính năng như hỗ trợ ưu tiên và nhiều kết nối hơn."
        },
        general: {
          welcomeTitle: "Xin chào!",
          welcomeTip: "Tôi là trợ lý AI của bạn. Tôi sẽ giúp bạn sử dụng hệ thống này hiệu quả nhất."
        }
      },
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
      permissionDenied: "Bạn không có quyền truy cập vào trang này",
      serverError: "Lỗi máy chủ",
      networkError: "Lỗi kết nối",
      pageNotFound: "Không tìm thấy trang",
      goHome: "Về trang chủ",
      tryAgain: "Thử lại",
      contactSupport: "Liên hệ hỗ trợ",
      lastUpdated: "Cập nhật lần cuối",
      createdAt: "Tạo lúc",
      updatedAt: "Cập nhật lúc",
      darkMode: "Chế độ tối",
      lightMode: "Chế độ sáng",
      systemMode: "Theo hệ thống",
      theme: "Giao diện",
      id: "ID"
    },
    dashboard: {
      title: "Bảng điều khiển",
      welcome: "Xin chào",
      overview: "Tổng quan",
      stats: {
        credits: "Tín dụng",
        articles: "Bài viết",
        storage: "Dung lượng",
        creditsLeft: "Tín dụng còn lại",
        articlesCreated: "Bài viết đã tạo",
        storageUsed: "Dung lượng đã dùng",
        connections: "Kết nối",
        recentArticles: "Bài viết gần đây",
        buyMoreCredits: "Mua thêm tín dụng",
        manageConnections: "Quản lý kết nối",
        articleTitle: "Tiêu đề",
        dateCreated: "Ngày tạo",
        status: "Trạng thái",
        keywords: "Từ khóa",
        actions: "Thao tác"
      },
      connectionStatus: {
        wordpress: {
          connected: "Đã kết nối"
        },
        social: {
          connected: "Đã kết nối"
        }
      },
      navigationItems: {
        myArticles: "Bài viết của tôi", 
        createContent: "Tạo nội dung",
        connections: "Kết nối",
        credits: "Tín dụng",
        plans: "Gói dịch vụ",
        settings: "Cài đặt"
      },
      articlesPage: {
        title: "Bài viết của tôi",
        empty: "Bạn chưa có bài viết nào. Hãy tạo bài viết đầu tiên!",
        filter: "Lọc bài viết",
        search: "Tìm kiếm bài viết",
        columns: {
          title: "Tiêu đề",
          status: "Trạng thái",
          created: "Ngày tạo",
          keywords: "Từ khóa",
          actions: "Thao tác"
        },
        status: {
          draft: "Bản nháp",
          published: "Đã xuất bản",
          deleted: "Đã xóa"
        },
        actions: {
          view: "Xem",
          edit: "Sửa",
          delete: "Xóa",
          publish: "Xuất bản"
        },
        createNew: "Tạo bài viết mới",
        viewDetails: "Xem chi tiết",
        publishTo: "Xuất bản đến",
        confirmation: {
          delete: "Bạn có chắc chắn muốn xóa bài viết này không?",
          publish: "Bạn có chắc chắn muốn xuất bản bài viết này không?"
        }
      },
      creditsPage: {
        title: "Tín dụng của tôi",
        balance: "Số dư tín dụng",
        buyMore: "Mua thêm tín dụng",
        history: "Lịch sử giao dịch",
        noPurchases: "Bạn chưa có giao dịch nào",
        transactions: {
          all: "Tất cả giao dịch",
          purchases: "Giao dịch mua",
          usage: "Giao dịch sử dụng"
        },
        purchase: {
          title: "Mua tín dụng",
          selectPackage: "Chọn gói tín dụng",
          paymentMethod: "Phương thức thanh toán",
          completePayment: "Hoàn tất thanh toán",
          confirmation: "Xác nhận mua"
        },
        columns: {
          date: "Ngày",
          description: "Mô tả",
          amount: "Số lượng",
          type: "Loại giao dịch"
        },
        transactionTypes: {
          purchase: "Mua",
          usage: "Sử dụng",
          refund: "Hoàn tiền",
          bonus: "Thưởng"
        }
      },
      plansPage: {
        title: "Gói dịch vụ",
        currentPlan: "Gói hiện tại của bạn",
        upgrade: "Nâng cấp gói",
        cancelPlan: "Hủy gói",
        renewalDate: "Ngày gia hạn",
        planDetails: "Chi tiết gói",
        creditPlans: "Gói tín dụng",
        storagePlans: "Gói lưu trữ",
        planTypes: {
          credit: "Tín dụng",
          storage: "Lưu trữ"
        },
        planPeriods: {
          monthly: "Hàng tháng",
          yearly: "Hàng năm"
        },
        popular: "Phổ biến",
        features: "Tính năng",
        includedFeatures: "Tính năng bao gồm",
        comparePlans: "So sánh các gói",
        selectPlan: "Chọn gói này",
        confirmation: {
          upgrade: "Bạn có chắc chắn muốn nâng cấp lên gói này không?",
          cancel: "Bạn có chắc chắn muốn hủy gói hiện tại không?"
        }
      },
      connectionsPage: {
        title: "Kết nối",
        connect: "Kết nối",
        disconnect: "Ngắt kết nối",
        configure: "Cấu hình",
        noConnections: "Bạn chưa có kết nối nào",
        wordpress: {
          title: "WordPress",
          description: "Kết nối với trang WordPress của bạn để xuất bản bài viết trực tiếp",
          form: {
            url: "URL trang WordPress",
            username: "Tên người dùng",
            password: "Application Password",
            urlPlaceholder: "https://trangcuaban.com",
            testConnection: "Kiểm tra kết nối"
          }
        },
        facebook: {
          title: "Facebook",
          description: "Kết nối với tài khoản Facebook để chia sẻ bài viết lên Trang hoặc Nhóm"
        },
        twitter: {
          title: "Twitter",
          description: "Kết nối với tài khoản Twitter để chia sẻ bài viết lên dòng thời gian"
        },
        tiktok: {
          title: "TikTok",
          description: "Kết nối với tài khoản TikTok để chia sẻ nội dung lên tài khoản của bạn"
        },
        connectionStatus: {
          connected: "Đã kết nối",
          notConnected: "Chưa kết nối",
          connecting: "Đang kết nối...",
          failed: "Kết nối thất bại"
        }
      },
      settingsPage: {
        title: "Cài đặt",
        profile: "Hồ sơ",
        account: "Tài khoản",
        security: "Bảo mật",
        notifications: "Thông báo",
        language: "Ngôn ngữ",
        appearance: "Giao diện",
        form: {
          name: "Tên",
          email: "Email",
          username: "Tên đăng nhập",
          currentPassword: "Mật khẩu hiện tại",
          newPassword: "Mật khẩu mới",
          confirmPassword: "Xác nhận mật khẩu",
          profilePicture: "Ảnh đại diện",
          uploadPicture: "Tải lên ảnh",
          removePicture: "Xóa ảnh",
          darkMode: "Chế độ tối",
          notifications: {
            email: "Thông báo qua email",
            app: "Thông báo trong ứng dụng",
            marketing: "Nhận email tiếp thị"
          }
        },
        save: "Lưu thay đổi",
        deleteAccount: "Xóa tài khoản",
        confirmation: {
          deleteAccount: "Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác."
        }
      },
      create: {
        title: "Tạo nội dung mới",
        form: {
          articleTitle: "Tiêu đề bài viết",
          contentType: "Loại nội dung",
          contentTypeOptions: {
            blog: "Blog",
            product: "Sản phẩm",
            news: "Tin tức",
            social: "Mạng xã hội"
          },
          keywords: "Từ khóa",
          length: "Độ dài",
          lengthOptions: {
            short: "Ngắn (300-500 từ)",
            medium: "Trung bình (500-800 từ)",
            long: "Dài (800-1200 từ)",
            extraLong: "Rất dài (1200-2000 từ)"
          },
          tone: "Giọng điệu",
          toneOptions: {
            professional: "Chuyên nghiệp",
            conversational: "Trò chuyện",
            informative: "Thông tin",
            persuasive: "Thuyết phục",
            humorous: "Hài hước"
          },
          prompt: "Mô tả nội dung",
          addHeadings: "Thêm tiêu đề và phụ đề tự động"
        },
        generateContent: "Tạo nội dung",
        reset: "Đặt lại",
        clear: "Xóa",
        preview: "Xem trước",
        copyContent: "Sao chép nội dung",
        downloadContent: "Tải xuống",
        saveArticle: "Lưu bài viết",
        notEnoughCredits: "Bạn không có đủ tín dụng để tạo nội dung. Vui lòng mua thêm tín dụng.",
        purchaseCredits: "mua thêm tín dụng",
        generatedContent: "Nội dung đã tạo",
        relatedKeywords: "Từ khóa liên quan"
      },
      mascot: {
        welcome: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn?",
        noArticles: "Bạn chưa có bài viết nào. Hãy tạo bài viết đầu tiên!",
        lowCredits: "Tín dụng của bạn sắp hết. Hãy mua thêm để tiếp tục sử dụng dịch vụ!",
        newFeature: "Chúng tôi vừa cập nhật tính năng mới! Hãy khám phá ngay!"
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
      }
    },
    admin: {
      dashboard: "Quản trị",
      users: "Người dùng",
      userManagement: "Quản lý người dùng",
      articles: "Bài viết",
      articleManagement: "Quản lý bài viết",
      plans: "Gói dịch vụ",
      plansManagement: "Quản lý gói dịch vụ",
      payments: "Thanh toán",
      paymentManagement: "Quản lý thanh toán",
      performance: "Hiệu suất",
      performanceInsights: "Thông số hiệu suất",
      history: "Lịch sử",
      historyLogs: "Nhật ký hệ thống",
      settings: "Cài đặt",
      systemSettings: "Cài đặt hệ thống",
      integrations: "Tích hợp",
      n8nWebhook: "Webhook n8n",
      adminPanel: "Bảng quản trị",
      stats: "Thống kê",
      overview: "Tổng quan",
      createUser: "Tạo người dùng mới",
      editUser: "Chỉnh sửa người dùng",
      deleteUser: "Xóa người dùng",
      userDetails: "Chi tiết người dùng",
      userRole: "Vai trò người dùng",
      activeUsers: "Người dùng đang hoạt động",
      inactiveUsers: "Người dùng không hoạt động",
      totalUsers: "Tổng số người dùng",
      newUsers: "Người dùng mới",
      userGrowth: "Tăng trưởng người dùng",
      recentArticles: "Bài viết gần đây",
      popularArticles: "Bài viết phổ biến",
      articleStats: "Thống kê bài viết",
      createPlan: "Tạo gói dịch vụ mới",
      editPlan: "Chỉnh sửa gói dịch vụ",
      deletePlan: "Xóa gói dịch vụ",
      planDetails: "Chi tiết gói dịch vụ",
      planType: "Loại gói",
      planValue: "Giá trị gói",
      planPrice: "Giá gói",
      planPeriod: "Thời hạn gói",
      recentPayments: "Thanh toán gần đây",
      paymentStats: "Thống kê thanh toán",
      revenue: "Doanh thu",
      revenueGrowth: "Tăng trưởng doanh thu",
      performanceMetrics: "Chỉ số hiệu suất",
      systemPerformance: "Hiệu suất hệ thống",
      userActivity: "Hoạt động người dùng",
      activityLogs: "Nhật ký hoạt động",
      systemLogs: "Nhật ký hệ thống",
      errorLogs: "Nhật ký lỗi",
      generalSettings: "Cài đặt chung",
      emailSettings: "Cài đặt email",
      securitySettings: "Cài đặt bảo mật",
      apiSettings: "Cài đặt API",
      webhookSettings: "Cài đặt webhook",
      webhookUrl: "URL webhook",
      webhookSecret: "Khóa bí mật webhook",
      testWebhook: "Kiểm tra webhook",
      webhookStatus: "Trạng thái webhook",
      smtpSettings: "Cài đặt SMTP",
      smtpServer: "Máy chủ SMTP",
      smtpPort: "Cổng SMTP",
      smtpUsername: "Tài khoản SMTP",
      smtpPassword: "Mật khẩu SMTP",
      emailSender: "Người gửi email",
      testSmtpConnection: "Kiểm tra kết nối SMTP",
      baseUrl: "URL cơ sở",
      saveSettings: "Lưu cài đặt",
      resetSettings: "Đặt lại cài đặt",
      confirmDelete: "Xác nhận xóa",
      deleteConfirmation: "Bạn có chắc chắn muốn xóa?",
      deletionWarning: "Hành động này không thể hoàn tác"
    }
  },
  en: {
    common: {
      loading: "Loading...",
      error: "An error occurred",
      appName: "SEO AI Writer",
      notConnected: "Not connected",
      loadingData: "Loading data...",
      viewAll: "View all",
      comparedToPreviousMonth: "compared to previous month",
      tagline: "AI-powered SEO content platform",
      mascot: {
        dashboard: {
          welcomeTitle: "Welcome!",
          welcomeTip: "Welcome to SEO AI Writer! This is where you can view an overview of your account.",
          creditsTitle: "Credits",
          creditsTip: "The credits displayed on the dashboard indicate how many new articles you can create.",
          articlesTitle: "Your Articles",
          articlesTip: "You can view your recent articles here and click to edit or publish them."
        },
        contentCreation: {
          welcomeTitle: "Start Creating Content!",
          welcomeTip: "Fill in all the information to create high-quality SEO content.",
          tipsTitle: "Content Creation Tips",
          tipsList: "Use precise keywords, choose a tone that matches your audience, and provide detailed descriptions for the best results.",
          creditsTitle: "Credit Usage",
          creditsTip: "Each article will use between 1-3 credits depending on the length you select."
        },
        articles: {
          welcomeTitle: "Your Articles",
          welcomeTip: "This is where you can manage all your created articles.",
          publishTitle: "Publish Articles",
          publishTip: "You can publish articles to WordPress or social media after connecting your accounts."
        },
        connections: {
          welcomeTitle: "Account Connections",
          welcomeTip: "Connect WordPress and social media to publish articles directly.",
          wordpressTitle: "WordPress",
          wordpressTip: "To connect WordPress, you need your website URL, username, and Application Password."
        },
        credits: {
          welcomeTitle: "Credit Management",
          welcomeTip: "Purchase more credits to continue creating high-quality content.",
          usageTitle: "Credit Usage",
          usageTip: "Credits are used when creating new content and have no expiration date."
        },
        plans: {
          welcomeTitle: "Subscription Plans",
          welcomeTip: "Upgrade to a higher plan to get more credits and storage space.",
          featuresTitle: "Features",
          featuresTip: "Premium plans include additional features like priority support and more connections."
        },
        general: {
          welcomeTitle: "Hello!",
          welcomeTip: "I'm your AI assistant. I will help you use this system effectively."
        }
      },
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
      permissionDenied: "You don't have permission to access this page",
      serverError: "Server error",
      networkError: "Network error",
      pageNotFound: "Page not found",
      goHome: "Go to home",
      tryAgain: "Try again",
      contactSupport: "Contact support",
      lastUpdated: "Last updated",
      createdAt: "Created at",
      updatedAt: "Updated at",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      systemMode: "System mode",
      theme: "Theme",
      id: "ID"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome",
      overview: "Overview",
      stats: {
        credits: "Credits",
        articles: "Articles",
        storage: "Storage",
        creditsLeft: "Credits Left",
        articlesCreated: "Articles Created",
        storageUsed: "Storage Used",
        connections: "Connections",
        recentArticles: "Recent Articles",
        buyMoreCredits: "Buy More Credits",
        manageConnections: "Manage Connections",
        articleTitle: "Title",
        dateCreated: "Date Created",
        status: "Status",
        keywords: "Keywords",
        actions: "Actions"
      },
      connectionStatus: {
        wordpress: {
          connected: "Connected"
        },
        social: {
          connected: "Connected"
        }
      },
      myArticles: "My Articles",
      createContent: "Create Content",
      connections: "Connections",
      credits: "Credits",
      plans: "Plans",
      settings: "Settings",
      create: {
        title: "Create New Content",
        form: {
          articleTitle: "Article Title",
          contentType: "Content Type",
          contentTypeOptions: {
            blog: "Blog",
            product: "Product",
            news: "News",
            social: "Social Media"
          },
          keywords: "Keywords",
          length: "Length",
          lengthOptions: {
            short: "Short (300-500 words)",
            medium: "Medium (500-800 words)",
            long: "Long (800-1200 words)",
            extraLong: "Extra Long (1200-2000 words)"
          },
          tone: "Tone",
          toneOptions: {
            professional: "Professional",
            conversational: "Conversational",
            informative: "Informative",
            persuasive: "Persuasive",
            humorous: "Humorous"
          },
          prompt: "Content Description",
          addHeadings: "Add automatic headings and subheadings"
        },
        generateContent: "Generate Content",
        reset: "Reset",
        clear: "Clear",
        preview: "Preview",
        copyContent: "Copy Content",
        downloadContent: "Download",
        saveArticle: "Save Article",
        notEnoughCredits: "You don't have enough credits to generate content. Please purchase more credits.",
        purchaseCredits: "purchase more credits",
        generatedContent: "Generated Content",
        relatedKeywords: "Related Keywords"
      },
      mascot: {
        welcome: "Hello! I'm your AI assistant. How can I help you today?",
        noArticles: "You don't have any articles yet. Let's create your first one!",
        lowCredits: "You're running low on credits. Purchase more to continue using our services!",
        newFeature: "We just updated with a new feature! Check it out now!"
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
    landing: {
      hero: {
        badge: "Advanced AI Technology",
        title: "Create High-Quality SEO Content Instantly",
        subtitle: "Use artificial intelligence to generate engaging, SEO-optimized content quickly and efficiently.",
        tryFree: "Try for Free",
        viewDemo: "View Demo"
      },
      features: {
        title: "Key Features",
        subtitle: "Discover powerful tools for effective SEO content creation",
        items: [
          {
            title: "Intelligent Content Creation",
            description: "Generate high-quality articles with advanced AI assistance."
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
      }
    },
    admin: {
      dashboard: "Dashboard",
      users: "Users",
      userManagement: "User Management",
      articles: "Articles",
      articleManagement: "Article Management",
      plans: "Plans",
      plansManagement: "Plans Management",
      payments: "Payments",
      paymentManagement: "Payment Management",
      performance: "Performance",
      performanceInsights: "Performance Insights",
      history: "History",
      historyLogs: "System Logs",
      settings: "Settings",
      systemSettings: "System Settings",
      integrations: "Integrations",
      n8nWebhook: "n8n Webhook",
      adminPanel: "Admin Panel",
      stats: "Statistics",
      overview: "Overview",
      createUser: "Create New User",
      editUser: "Edit User",
      deleteUser: "Delete User",
      userDetails: "User Details",
      userRole: "User Role",
      activeUsers: "Active Users",
      inactiveUsers: "Inactive Users",
      totalUsers: "Total Users",
      newUsers: "New Users",
      userGrowth: "User Growth",
      recentArticles: "Recent Articles",
      popularArticles: "Popular Articles",
      articleStats: "Article Statistics",
      createPlan: "Create New Plan",
      editPlan: "Edit Plan",
      deletePlan: "Delete Plan",
      planDetails: "Plan Details",
      planType: "Plan Type",
      planValue: "Plan Value",
      planPrice: "Plan Price",
      planPeriod: "Plan Period",
      recentPayments: "Recent Payments",
      paymentStats: "Payment Statistics",
      revenue: "Revenue",
      revenueGrowth: "Revenue Growth",
      performanceMetrics: "Performance Metrics",
      systemPerformance: "System Performance",
      userActivity: "User Activity",
      activityLogs: "Activity Logs",
      systemLogs: "System Logs",
      errorLogs: "Error Logs",
      generalSettings: "General Settings",
      emailSettings: "Email Settings",
      securitySettings: "Security Settings",
      apiSettings: "API Settings",
      webhookSettings: "Webhook Settings",
      webhookUrl: "Webhook URL",
      webhookSecret: "Webhook Secret",
      testWebhook: "Test Webhook",
      webhookStatus: "Webhook Status",
      smtpSettings: "SMTP Settings",
      smtpServer: "SMTP Server",
      smtpPort: "SMTP Port",
      smtpUsername: "SMTP Username",
      smtpPassword: "SMTP Password",
      emailSender: "Email Sender",
      testSmtpConnection: "Test SMTP Connection",
      baseUrl: "Base URL",
      saveSettings: "Save Settings",
      resetSettings: "Reset Settings",
      confirmDelete: "Confirm Delete",
      deleteConfirmation: "Are you sure you want to delete?",
      deletionWarning: "This action cannot be undone"
    }
  }
};

const defaultLanguage: Language = 'vi';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

export { LanguageContext };

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

// Export is now in hooks/use-language.tsx
