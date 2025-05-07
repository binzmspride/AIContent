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
      or: "Hoặc"
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
      }
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
      or: "Or"
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
      }
    }
  }
};

const defaultLanguage: Language = 'vi';

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key
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