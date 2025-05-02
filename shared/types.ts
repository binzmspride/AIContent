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
