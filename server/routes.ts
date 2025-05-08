import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import * as schema from "@shared/schema";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { 
  ApiResponse, 
  GenerateContentRequest, 
  GenerateContentResponse, 
  PlanType,
  PerformanceMetrics,
  TimeRange,
  PerformancePoint
} from "@shared/types";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { updateSmtpConfig, testSmtpConnection, updateAppBaseUrl } from "./email-service";
import { registerApiRoutes } from "./api-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Register API routes for third-party integration
  registerApiRoutes(app);

  // API routes
  const httpServer = createServer(app);
  
  // ========== Translations API ==========
  // Get translations for the frontend
  app.get('/api/translations', (req, res) => {
    try {
      console.log('Client requested translations, but now using client-side implementation');
      // We've moved translations to client side, just return empty success
      res.json({ 
        success: true, 
        message: 'Using client-side translations now'
      });
    } catch (error) {
      console.error('Error in translations endpoint:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch translations' });
    }
  });

  // ========== Plans API ==========
  // Get all plans
  app.get('/api/plans', async (req, res) => {
    try {
      const type = req.query.type as PlanType | undefined;
      const plans = await storage.getPlans(type);
      res.json({ success: true, data: plans });
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }
  });

  // ========== Dashboard API ==========
  // Get dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      
      // Get user's credit balance
      const creditBalance = await storage.getUserCredits(userId);
      
      // Get user's articles
      const { articles, total: totalArticles } = await storage.getArticlesByUser(userId, 1, 0);
      
      // Get user's connections
      const connections = await storage.getConnections(userId);
      
      // Get user's storage plan
      const userPlans = await storage.getUserPlans(userId);
      const storagePlan = userPlans.find(up => up.plan.type === 'storage' && up.isActive);
      
      // Calculate monthly change (mock data for now)
      const monthlyChange = 0.12; // 12% increase
      
      // Prepare connections status
      const connectionsStatus = {
        wordpress: connections.some(c => c.type === 'wordpress' && c.isActive),
        facebook: connections.some(c => c.type === 'facebook' && c.isActive),
        tiktok: connections.some(c => c.type === 'tiktok' && c.isActive),
        twitter: connections.some(c => c.type === 'twitter' && c.isActive),
      };
      
      // Prepare storage stats
      const storageStats = storagePlan 
        ? {
            current: storagePlan.usedStorage,
            total: storagePlan.plan.value,
            percentage: (storagePlan.usedStorage / storagePlan.plan.value) * 100
          }
        : {
            current: 0,
            total: 0,
            percentage: 0
          };
      
      res.json({
        success: true,
        data: {
          creditBalance,
          articlesCreated: {
            total: totalArticles,
            monthlyChange
          },
          storageUsed: storageStats,
          connections: connectionsStatus
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
  });

  // Get user's articles
  app.get('/api/dashboard/articles', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      const { articles, total } = await storage.getArticlesByUser(userId, page, limit);
      
      res.json({
        success: true,
        data: {
          articles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user articles:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch articles' });
    }
  });

  // Create article
  app.post('/api/dashboard/articles', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { title, content, keywords, creditsUsed = 1 } = req.body;
      
      // Check if user has enough credits
      const userCredits = await storage.getUserCredits(userId);
      if (userCredits < creditsUsed) {
        return res.status(400).json({ success: false, error: 'Insufficient credits' });
      }
      
      // Create article
      const article = await storage.createArticle({
        userId,
        title,
        content,
        keywords,
        creditsUsed,
        status: 'draft'
      });
      
      // Subtract credits
      await storage.subtractUserCredits(userId, creditsUsed, `Created article: ${title}`);
      
      res.status(201).json({ success: true, data: article });
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ success: false, error: 'Failed to create article' });
    }
  });

  // Generate content (mock API for now)
  app.post('/api/dashboard/generate-content', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const contentRequest = req.body as GenerateContentRequest;
      
      // Determine credits needed based on content length
      let creditsNeeded = 1;
      if (contentRequest.length === 'long') creditsNeeded = 2;
      if (contentRequest.length === 'extra_long') creditsNeeded = 3;
      
      // Check if user has enough credits
      const userCredits = await storage.getUserCredits(userId);
      if (userCredits < creditsNeeded) {
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient credits' 
        });
      }
      
      // This would be replaced with actual AI content generation using n8n webhook
      // For now, return mock content
      const mockResponse: GenerateContentResponse = {
        title: contentRequest.title,
        content: `<h1>${contentRequest.title}</h1>
          <p>This is a placeholder for AI-generated content. In a real implementation, this would be generated based on the provided parameters using the n8n webhook.</p>
          <h2>About this topic</h2>
          <p>This content would be optimized for SEO with keywords: ${contentRequest.keywords}</p>
          ${contentRequest.relatedKeywords ? `<p>Related keywords: ${contentRequest.relatedKeywords}</p>` : ''}
          <h2>More information</h2>
          <p>The content would be written in a ${contentRequest.tone} tone and would be approximately ${contentRequest.length === 'short' ? '500' : contentRequest.length === 'medium' ? '1000' : contentRequest.length === 'long' ? '1500' : '2000'} words long.</p>
          <p>Custom prompt details: ${contentRequest.prompt}</p>`,
        keywords: contentRequest.keywords.split(',').map(k => k.trim()),
        creditsUsed: creditsNeeded,
        metrics: {
          generationTimeMs: 1500, // Giả lập thời gian tạo nội dung (1.5 giây)
          wordCount: contentRequest.length === 'short' ? 500 : 
                    contentRequest.length === 'medium' ? 1000 : 
                    contentRequest.length === 'long' ? 1500 : 2000,
          characterCount: contentRequest.length === 'short' ? 3000 : 
                         contentRequest.length === 'medium' ? 6000 : 
                         contentRequest.length === 'long' ? 9000 : 12000
        }
      };
      
      // In the real implementation, we would wait for the n8n webhook response
      // and then create the article and subtract credits
      
      res.json({ success: true, data: mockResponse });
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ success: false, error: 'Failed to generate content' });
    }
  });

  // Get user's connections
  app.get('/api/dashboard/connections', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const connections = await storage.getConnections(userId);
      
      res.json({ success: true, data: connections });
    } catch (error) {
      console.error('Error fetching connections:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch connections' });
    }
  });

  // Add WordPress connection
  app.post('/api/dashboard/connections/wordpress', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { url, username, appPassword } = req.body;
      
      if (!url || !username || !appPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL, username and appPassword are required' 
        });
      }
      
      // In a real implementation, we would validate the WordPress credentials
      // by making a test request to the WordPress REST API
      
      const connection = await storage.createConnection({
        userId,
        type: 'wordpress',
        name: url,
        config: { url, username, appPassword },
        isActive: true
      });
      
      res.status(201).json({ success: true, data: connection });
    } catch (error) {
      console.error('Error adding WordPress connection:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to add WordPress connection' 
      });
    }
  });

  // Add social media connection
  app.post('/api/dashboard/connections/social', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { platform, accessToken, accountName, accountId } = req.body;
      
      if (!platform || !accessToken || !accountName || !accountId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Platform, accessToken, accountName and accountId are required' 
        });
      }
      
      // Create connection
      const connection = await storage.createConnection({
        userId,
        type: platform as schema.Connection['type'],
        name: accountName,
        config: { accessToken, accountName, accountId },
        isActive: true
      });
      
      res.status(201).json({ success: true, data: connection });
    } catch (error) {
      console.error('Error adding social media connection:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to add social media connection' 
      });
    }
  });

  // Get credit history
  app.get('/api/dashboard/credits/history', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      const { transactions, total } = await storage.getCreditHistory(userId, page, limit);
      
      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching credit history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch credit history' });
    }
  });

  // Purchase credits
  app.post('/api/dashboard/credits/purchase', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ success: false, error: 'Plan ID is required' });
      }
      
      // Get plan details
      const plan = await storage.getPlan(planId);
      if (!plan || plan.type !== 'credit') {
        return res.status(400).json({ success: false, error: 'Invalid plan ID' });
      }
      
      // In a real implementation, we would integrate with a payment gateway here
      // For now, just add the credits to the user's account
      
      const newCreditBalance = await storage.addUserCredits(
        userId, 
        plan.value, 
        planId, 
        `Purchased ${plan.value} credits (${plan.name})`
      );
      
      res.json({
        success: true,
        data: {
          credits: newCreditBalance,
          plan: plan.name,
          amount: plan.value,
        }
      });
    } catch (error) {
      console.error('Error purchasing credits:', error);
      res.status(500).json({ success: false, error: 'Failed to purchase credits' });
    }
  });

  // Get user's plans
  app.get('/api/dashboard/user-plans', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const userPlans = await storage.getUserPlans(userId);
      
      res.json({ 
        success: true, 
        data: { 
          userPlans 
        } 
      });
    } catch (error) {
      console.error('Error fetching user plans:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user plans' });
    }
  });

  // Purchase storage plan
  app.post('/api/dashboard/plans/purchase', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ success: false, error: 'Plan ID is required' });
      }
      
      // Get plan details
      const plan = await storage.getPlan(planId);
      if (!plan || plan.type !== 'storage') {
        return res.status(400).json({ success: false, error: 'Invalid plan ID' });
      }
      
      // Calculate end date
      const startDate = new Date();
      let endDate = null;
      if (plan.duration) {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);
      }
      
      // In a real implementation, we would integrate with a payment gateway here
      // For now, just create the user plan
      
      const userPlan = await storage.createUserPlan({
        userId,
        planId,
        startDate,
        endDate,
        isActive: true,
        usedStorage: 0
      });
      
      res.status(201).json({
        success: true,
        data: {
          ...userPlan,
          plan
        }
      });
    } catch (error) {
      console.error('Error purchasing storage plan:', error);
      res.status(500).json({ success: false, error: 'Failed to purchase storage plan' });
    }
  });

  // Update user profile
  app.patch('/api/dashboard/profile', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { fullName, email, language } = req.body;
      
      // Update user
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        language
      });
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Don't include password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  });

  // Change password
  app.post('/api/dashboard/change-password', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Current password and new password are required' 
        });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Verify current password
      const scryptAsync = promisify(scrypt);
      const [hashed, salt] = user.password.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(currentPassword, salt, 64)) as Buffer;
      
      const passwordMatches = timingSafeEqual(hashedBuf, suppliedBuf);
      if (!passwordMatches) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const newSalt = randomBytes(16).toString("hex");
      const newHashedBuf = (await scryptAsync(newPassword, newSalt, 64)) as Buffer;
      const newHashedPassword = `${newHashedBuf.toString("hex")}.${newSalt}`;
      
      // Update user
      await storage.updateUser(userId, {
        password: newHashedPassword
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  });

  // ========== Admin API ==========
  // Get all users
  app.get('/api/admin/users', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      const { users, total } = await storage.listUsers(page, limit);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json({
        success: true,
        data: {
          users: usersWithoutPasswords,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  });

  // Update user (admin)
  app.patch('/api/admin/users/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const userId = parseInt(req.params.id);
      const { fullName, email, role, credits, language } = req.body;
      
      // Update user
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        role,
        credits,
        language
      });
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Don't include password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }
  });

  // Delete user (admin)
  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const userId = parseInt(req.params.id);
      
      // Không cho phép xóa tài khoản admin
      if (userId === 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'Không thể xóa tài khoản admin mặc định' 
        });
      }

      // Lấy thông tin người dùng để kiểm tra
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });
      }
      
      // Thực hiện xóa người dùng
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(500).json({ 
          success: false, 
          error: 'Không thể xóa người dùng do lỗi hệ thống' 
        });
      }
      
      res.json({ success: true, message: 'Người dùng đã được xóa thành công' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, error: 'Không thể xóa người dùng' });
    }
  });

  // Get admin dashboard stats
  app.get('/api/admin/stats', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      // Get total users
      const { total: totalUsers } = await storage.listUsers(1, 0);
      
      // Get total articles
      const [{ count: totalArticles }] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(schema.articles);
      
      // Get total credits purchased (sum of positive credit transactions)
      const [{ sum: totalCredits }] = await db
        .select({ sum: sql`sum(amount)`.mapWith(Number) })
        .from(schema.creditTransactions)
        .where(sql`amount > 0`);
      
      // Get total revenue (sum of credit and storage plan purchases)
      // In a real implementation, this would come from actual payment records
      // For now, just estimate based on credit transactions
      const totalRevenue = totalCredits ? totalCredits * 10000 : 0; // Rough estimate
      
      res.json({
        success: true,
        data: {
          totalUsers,
          totalArticles,
          totalCredits: totalCredits || 0,
          totalRevenue
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
    }
  });
  
  // Get performance metrics for the admin dashboard
  app.get('/api/admin/performance', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      
      const timeRange = (req.query.timeRange as TimeRange) || 'week';
      
      // Generate performance data based on time range (this would be replaced with real data in production)
      const dataPoints = timeRange === 'day' ? 24 : 
                        timeRange === 'week' ? 7 : 
                        timeRange === 'month' ? 30 : 365;
      
      const data: PerformancePoint[] = [];
      
      // Base values for metrics
      const baseVisitors = 500;
      const basePageViews = 1200;
      const baseResponseTime = 180; // ms
      const baseServerLoad = 35; // %
      const baseEngagementRate = 42; // %
      const baseSessionTime = 120; // seconds
      const baseConversionRate = 3.5; // %
      
      // Generate time labels
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date();
        if (timeRange === 'day') {
          date.setHours(date.getHours() - (dataPoints - i - 1));
        } else if (timeRange === 'week') {
          date.setDate(date.getDate() - (dataPoints - i - 1));
        } else if (timeRange === 'month') {
          date.setDate(date.getDate() - (dataPoints - i - 1));
        } else {
          date.setDate(date.getDate() - (dataPoints - i - 1));
        }
        
        // Variation
        const variationFactor = 0.3; // 30% variation
        const randomVariation = () => (Math.random() * 2 - 1) * variationFactor;
        
        // Calculate metrics with natural progression (higher towards the end)
        const progressFactor = i / dataPoints; // 0 to 1
        const trendIncrease = 1 + (progressFactor * 0.3); // up to 30% increase
        
        const visitors = Math.max(10, Math.round(baseVisitors * trendIncrease * (1 + randomVariation())));
        const pageViews = Math.max(20, Math.round(basePageViews * trendIncrease * (1 + randomVariation())));
        const responseTime = Math.max(50, Math.round(baseResponseTime * (1 - progressFactor * 0.2) * (1 + randomVariation())));
        const serverLoad = Math.max(5, Math.round(baseServerLoad * (1 + randomVariation())));
        const engagementRate = Math.min(100, Math.max(5, Math.round(baseEngagementRate * trendIncrease * (1 + randomVariation()))));
        const avgSessionTime = Math.max(30, Math.round(baseSessionTime * trendIncrease * (1 + randomVariation())));
        const conversionRate = Math.min(10, Math.max(0.5, +(baseConversionRate * trendIncrease * (1 + randomVariation())).toFixed(1)));
        
        const name = timeRange === 'day' ? `${date.getHours()}:00` : 
                    timeRange === 'week' ? date.toLocaleDateString('en-US', { weekday: 'short' }) : 
                    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        data.push({
          name,
          timestamp: date.toISOString(),
          visitors,
          pageViews,
          responseTime,
          serverLoad,
          engagementRate,
          avgSessionTime,
          conversionRate
        });
      }
      
      // Calculate summary
      const totalVisitors = data.reduce((sum, item) => sum + (item.visitors || 0), 0);
      const totalPageViews = data.reduce((sum, item) => sum + (item.pageViews || 0), 0);
      const avgResponseTime = Math.round(data.reduce((sum, item) => sum + (item.responseTime || 0), 0) / data.length);
      const avgServerLoad = Math.round(data.reduce((sum, item) => sum + (item.serverLoad || 0), 0) / data.length);
      const avgEngagementRate = Math.round(data.reduce((sum, item) => sum + (item.engagementRate || 0), 0) / data.length);
      const avgSessionTime = Math.round(data.reduce((sum, item) => sum + (item.avgSessionTime || 0), 0) / data.length);
      const avgConversionRate = +(data.reduce((sum, item) => sum + (item.conversionRate || 0), 0) / data.length).toFixed(1);
      
      // Calculate trends (compared to previous period)
      const metrics: PerformanceMetrics = {
        timeRange,
        data,
        summary: {
          totalVisitors,
          totalPageViews,
          avgResponseTime,
          avgServerLoad,
          avgEngagementRate,
          avgSessionTime,
          avgConversionRate,
          trends: {
            visitors: 5.2, // % change
            pageViews: 8.1,
            responseTime: -12.3, // negative means improved (faster)
            serverLoad: 3.5,
            engagementRate: 4.7,
            sessionTime: 6.2,
            conversionRate: 2.8
          }
        }
      };
      
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch performance metrics' });
    }
  });

  // Email settings API (update SMTP settings)
  app.patch('/api/admin/settings/email', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const { smtpServer, smtpPort, smtpUsername, smtpPassword, emailSender, appBaseUrl } = req.body;
      
      // Validate the settings structure
      if (!smtpServer || !smtpPort || !smtpUsername || !smtpPassword || !emailSender) {
        return res.status(400).json({ 
          success: false, 
          error: 'Tất cả thông tin SMTP là bắt buộc' 
        });
      }
      
      // Validate the app base URL if provided
      if (appBaseUrl && !appBaseUrl.startsWith('http')) {
        return res.status(400).json({
          success: false,
          error: 'URL cơ sở của ứng dụng phải bắt đầu bằng http:// hoặc https://'
        });
      }
      
      // Cập nhật cấu hình SMTP và lưu vào database
      const smtpResult = await updateSmtpConfig({
        smtpServer,
        smtpPort: Number(smtpPort),
        smtpUsername,
        smtpPassword,
        emailSender
      });
      
      if (!smtpResult) {
        return res.status(500).json({ 
          success: false, 
          error: 'Không thể cập nhật cấu hình SMTP' 
        });
      }
      
      // Cập nhật URL cơ sở của ứng dụng nếu được cung cấp
      if (appBaseUrl) {
        const appUrlResult = await updateAppBaseUrl(appBaseUrl);
        if (!appUrlResult) {
          return res.status(500).json({
            success: false,
            error: 'Không thể cập nhật URL cơ sở của ứng dụng'
          });
        }
      }
      
      res.json({
        success: true,
        message: 'Cài đặt email đã được cập nhật thành công'
      });
    } catch (error) {
      console.error('Error updating email settings:', error);
      res.status(500).json({ success: false, error: 'Không thể cập nhật cài đặt email' });
    }
  });
  
  // Test email API
  app.post('/api/admin/settings/email/test', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      // Get the test email recipient
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp địa chỉ email để kiểm tra'
        });
      }
      
      // Gửi email test bằng SMTP
      const result = await testSmtpConnection(email);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Email kiểm tra đã được gửi thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Không thể gửi email kiểm tra'
        });
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error sending test email:', error);
      res.status(500).json({ 
        success: false, 
        error: `Không thể gửi email kiểm tra: ${error.message || 'Lỗi không xác định'}` 
      });
    }
  });

  return httpServer;
}
