// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Content generation types
export interface GenerateContentRequest {
  title: string;
  contentType: 'blog' | 'product' | 'news' | 'social';
  keywords: string;
  length: 'short' | 'medium' | 'long' | 'extra_long';
  tone: 'professional' | 'conversational' | 'informative' | 'persuasive' | 'humorous';
  prompt: string;
  addHeadings: boolean;
}

export interface GenerateContentResponse {
  title: string;
  content: string;
  keywords: string[];
  creditsUsed: number;
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
