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
      myArticles: "Bài viết của tôi",
      createContent: "Tạo nội dung",
      connections: "Kết nối",
      credits: "Tín dụng",
      plans: "Gói dịch vụ",
      settings: "Cài đặt",
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

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

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
