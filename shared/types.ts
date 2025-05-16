// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Content generation types
export interface GenerateContentRequest {
  title?: string; // Không bắt buộc nhập tiêu đề
  contentType: 'blog' | 'product' | 'news' | 'social';
  keywords: string;
  length: 'short' | 'medium' | 'long' | 'extra_long';
  tone: 'professional' | 'conversational' | 'informative' | 'persuasive' | 'humorous' | 'neutral';
  prompt: string;
  addHeadings: boolean;
  relatedKeywords?: string; // Từ khóa liên quan, dạng chuỗi phân tách bởi dấu phẩy
  language?: 'vietnamese' | 'english';
  country?: 'vietnam' | 'us' | 'global';
  perspective?: 'auto' | 'first' | 'second' | 'third';
  complexity?: 'auto' | 'basic' | 'intermediate' | 'advanced';
  useWebResearch?: boolean; // Cho phép AI tìm kiếm thông tin trên web
  refSources?: string; // Nguồn tham khảo cụ thể
  aiModel?: 'chatgpt' | 'gemini' | 'claude'; // Mô hình AI sử dụng
  useBold?: boolean; // Sử dụng định dạng in đậm
  useItalic?: boolean; // Sử dụng định dạng in nghiêng
  useBullets?: boolean; // Sử dụng định dạng danh sách
  linkItems?: Array<{ keyword?: string; url?: string }>; // Danh sách liên kết
  imageSize?: 'small' | 'medium' | 'large'; // Kích thước hình ảnh
}

export interface ContentGenerationMetrics {
  generationTimeMs: number;
  wordCount: number;
  characterCount?: number;
}

export interface GenerateContentResponse {
  title: string;
  content: string;
  keywords: string[];
  creditsUsed: number;
  metrics: ContentGenerationMetrics;
  articleId?: number; // ID của bài viết đã lưu trong database
}

// WordPress connection types
export interface WordPressConnection {
  url: string;
  username: string;
  appPassword: string;
}

// Social media connection types
export interface SocialMediaConnection {
  platform: 'facebook' | 'twitter' | 'tiktok';
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  accountName: string;
  accountId: string;
}

// Dashboard statistics types
export interface DashboardStats {
  creditBalance: number;
  articlesCreated: {
    total: number;
    monthlyChange: number;
  };
  storageUsed: {
    current: number;
    total: number;
    percentage: number;
  };
  connections: {
    wordpress: boolean;
    facebook: boolean;
    tiktok: boolean;
    twitter: boolean;
  };
}

// Credit package types
export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

// Storage package types
export interface StoragePackage {
  id: number;
  name: string;
  storage: number; // in GB
  price: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
}

// Language type
export type Language = 'vi' | 'en';

// Theme type
export type Theme = 'light' | 'dark';

// Plan type
export type PlanType = 'credit' | 'storage';

// Performance data types
export type TimeRange = 'day' | 'week' | 'month' | 'year';

export type ChartType = 'traffic' | 'performance' | 'engagement' | 'conversion' | 'overview';

export interface PerformancePoint {
  name: string;
  timestamp: string;
  visitors?: number;
  pageViews?: number;
  responseTime?: number;
  serverLoad?: number;
  engagementRate?: number;
  avgSessionTime?: number;
  conversionRate?: number;
}

export interface PerformanceMetrics {
  timeRange: TimeRange;
  data: PerformancePoint[];
  summary: {
    totalVisitors: number;
    totalPageViews: number;
    avgResponseTime: number;
    avgServerLoad: number;
    avgEngagementRate: number;
    avgSessionTime: number;
    avgConversionRate: number;
    trends: {
      visitors: number;
      pageViews: number;
      responseTime: number;
      serverLoad: number;
      engagementRate: number;
      sessionTime: number;
      conversionRate: number;
    }
  }
}

// SMTP configuration type
export interface SmtpConfig {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailSender: string;
}
