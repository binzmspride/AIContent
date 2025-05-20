import type { Express } from "express";
import { createServer, type Server } from "http";
import https from 'https';
import { storage } from "./storage";
import { setupAuth } from "./auth";
import * as schema from "@shared/schema";
import { db } from "../db";
import { sql, eq } from "drizzle-orm";
import { ApiResponse, GenerateContentRequest, GenerateContentResponse } from "@shared/types";
import { systemSettings } from "@shared/schema";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Interface để thêm trường vào content request
interface ExtendedContentRequest extends GenerateContentRequest {
  articleId?: number;
  userId?: number;
  username?: string;
  timestamp?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  const httpServer = createServer(app);

  // ========== Plans API ==========
  // Get all plans
  app.get('/api/plans', async (req, res) => {
    try {
      const type = req.query.type as schema.PlanType | undefined;
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

  // Get article by id
  app.get('/api/dashboard/articles/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const articleId = parseInt(req.params.id, 10);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, error: 'Invalid article ID' });
      }
      
      const article = await storage.getArticleById(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      
      // Kiểm tra quyền sở hữu bài viết
      if (article.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'You do not have permission to access this article' });
      }
      
      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error fetching article details:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch article details' });
    }
  });

  // Update article by id
  app.patch('/api/dashboard/articles/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const articleId = parseInt(req.params.id, 10);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, error: 'Invalid article ID' });
      }
      
      const article = await storage.getArticleById(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }
      
      // Kiểm tra quyền sở hữu bài viết
      if (article.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'You do not have permission to update this article' });
      }
      
      // Lấy dữ liệu cập nhật
      const { title, content, keywords, status } = req.body;
      
      // Cập nhật bài viết
      const updatedArticle = await storage.updateArticle(articleId, {
        title,
        content,
        keywords,
        status,
      });
      
      res.json({ success: true, data: updatedArticle });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ success: false, error: 'Failed to update article' });
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

  // Generate content API - tạo nội dung trong ứng dụng
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
          <h2>More information</h2>
          <p>The content would be written in a ${contentRequest.tone} tone and would be approximately ${contentRequest.length === 'short' ? '500' : contentRequest.length === 'medium' ? '1000' : contentRequest.length === 'long' ? '1500' : '2000'} words long.</p>
          <p>Custom prompt details: ${contentRequest.prompt}</p>`,
        keywords: contentRequest.keywords.split(',').map(k => k.trim()),
        creditsUsed: creditsNeeded
      };
      
      // Get webhook URL from system settings
      const webhookSettingRes = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, 'notificationWebhookUrl')
      });
      
      const webhookUrl = webhookSettingRes?.value;
      console.log('=== GENERATE CONTENT API CALLED ===');
      console.log('Webhook URL from database:', webhookUrl);
      
      // Xóa chế độ offline mode theo yêu cầu
      
      if (!webhookUrl) {
        return res.status(404).json({ 
          success: false, 
          error: 'Webhook URL not configured'
        });
      }
      
      // Lấy webhook secret
      const webhookSecretRes = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, 'webhook_secret')
      });
      const webhookSecret = webhookSecretRes?.value;
      console.log('Webhook Secret from database:', webhookSecret ? '(exists)' : '(missing)');
      
      // Gửi request đến webhook
      console.log('Sending content request to webhook:', webhookUrl);
      
      // Thêm userId và username vào yêu cầu
      contentRequest.userId = userId;
      contentRequest.username = req.user.username;
      contentRequest.timestamp = new Date().toISOString();
      
      // Ghi log yêu cầu gửi đến webhook
      console.log('Webhook payload:', JSON.stringify(contentRequest, null, 2));
      
      // Tạo header cho request
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Thêm header X-Webhook-Secret nếu có
      if (webhookSecret) {
        headers['X-Webhook-Secret'] = webhookSecret;
      }
      
      // ===== GIẢI PHÁP MỚI CHO WEBHOOK TIMEOUT =====
      // 
      // Thay vì chờ đợi webhook hoàn thành (có thể mất hơn 1 phút - bị timeout),
      // chúng ta sẽ:
      // 1. Tạo bài viết nháp ngay lập tức
      // 2. Trả về bài viết nháp cho người dùng
      // 3. Khởi chạy webhook trong background
      // 4. Cập nhật bài viết khi webhook hoàn thành
      
      // Tạo bài viết nháp trong cơ sở dữ liệu
      const draftArticle: schema.InsertArticle = {
        userId,
        title: "Đang xử lý",
        content: "<p>Đang xử lý yêu cầu tạo nội dung...</p>",
        keywords: contentRequest.keywords, 
        status: "draft",
        publishedUrl: null,
        creditsUsed: creditsNeeded
      };
      
      try {
        // Lưu bài viết nháp trước khi gửi webhook
        const savedDraft = await storage.createArticle(draftArticle);
        console.log('Draft article saved with ID:', savedDraft.id);
        
        // Trừ credits người dùng
        await storage.subtractUserCredits(userId, creditsNeeded, "Tạo nội dung bài viết");
        
        // Thêm articleId vào request webhook để cập nhật bài viết sau khi webhook hoàn thành
        const extendedRequest: ExtendedContentRequest = {
          ...contentRequest,
          articleId: savedDraft.id,
          userId,
          username: req.user.username,
          timestamp: new Date().toISOString()
        };
        
        // Gửi webhook trong một tiến trình riêng không chờ đợi
        console.log('Starting webhook request in background at:', new Date().toISOString());
        
        // Khởi động request webhook mà không chờ đợi kết quả
        fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(extendedRequest)
        })
        .then(async (webhookResponse) => {
          console.log('Webhook response received at:', new Date().toISOString(), 'Status:', webhookResponse.status);
          
          if (!webhookResponse.ok) {
            console.log(`Webhook error status: ${webhookResponse.status}`);
            return;
          }
          
          try {
            // Xử lý phản hồi webhook và cập nhật bài viết trong cơ sở dữ liệu
            const responseText = await webhookResponse.text();
            let webhookData;
            
            try {
              webhookData = JSON.parse(responseText);
              console.log('Webhook response content received successfully');
            } catch (parseError) {
              console.error('Failed to parse webhook response as JSON:', parseError);
              return;
            }
            
            if (savedDraft.id && webhookData) {
              // Cập nhật bài viết với nội dung từ webhook
              const updatedArticle = {
                title: webhookData[0]?.aiTitle || webhookData?.aiTitle || "Bài viết mới",
                content: webhookData[0]?.content || webhookData?.content || "<p>Không có nội dung</p>",
                updatedAt: new Date()
              };
              
              await storage.updateArticle(savedDraft.id, updatedArticle);
              console.log('Article updated with content from webhook, article ID:', savedDraft.id);
            }
          } catch (error) {
            console.error('Error processing webhook response:', error);
          }
        })
        .catch(error => {
          console.error('Webhook request failed:', error);
        });
        
        // Trả về bài viết nháp cho người dùng ngay lập tức
        return res.status(200).json({
          success: true,
          data: [{
            title: "Đang xử lý", 
            content: "<p>Đang xử lý yêu cầu tạo nội dung...</p>", 
            articleId: savedDraft.id,
            keywords: contentRequest.keywords.split(',').map(k => k.trim()),
            creditsUsed: creditsNeeded
          }]
        });
      } catch (error) {
        console.error('Error creating draft article:', error);
        
        return res.status(500).json({
          success: false,
          error: 'Không thể tạo bài viết. Vui lòng thử lại sau.'
        });
      }
        }
      } catch (webhookError: any) {
        console.error('Error calling webhook:', webhookError);
        
        // Kiểm tra xem lỗi có phải là timeout không
        if (webhookError.name === 'AbortError' || webhookError.name === 'TimeoutError') {
          console.log('Xử lý lỗi timeout webhook');
          

          
          return res.status(504).json({
            success: false,
            error: 'Không thể kết nối với dịch vụ tạo nội dung. Mã lỗi: 504. Vui lòng kiểm tra cấu hình webhook.'
          });
        }
        

        
        return res.status(500).json({
          success: false,
          error: 'Error calling webhook. Please check the webhook configuration.'
        });
      }
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
  
  // Get admin settings
  app.get('/api/admin/settings', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      // Lấy tất cả cài đặt từ cơ sở dữ liệu
      // Phân loại theo danh mục
      const generalSettings = await storage.getSettingsByCategory('general');
      const aiSettings = await storage.getSettingsByCategory('ai');
      const emailSettings = await storage.getSettingsByCategory('smtp');
      
      // Lấy cài đặt webhook và thông báo
      const integrationSettings = await storage.getSettingsByCategory('integration');
      console.log('Integration settings retrieved:', integrationSettings);
      const apiSettings = await storage.getSettingsByCategory('api');
      const firebaseSettings = await storage.getSettingsByCategory('firebase');
      
      // Chuẩn bị đối tượng cài đặt
      const settings = {
        // General settings
        siteName: generalSettings.siteName || "SEO AI Writer",
        siteDescription: generalSettings.siteDescription || "AI-powered SEO content generator",
        contactEmail: generalSettings.contactEmail || "support@seoaiwriter.com",
        supportEmail: generalSettings.supportEmail || "support@seoaiwriter.com",
        
        // Feature flags
        enableNewUsers: generalSettings.enableNewUsers === "true",
        enableArticleCreation: generalSettings.enableArticleCreation === "true",
        enableAutoPublish: generalSettings.enableAutoPublish === "true",
        maintenanceMode: generalSettings.maintenanceMode === "true",
        offlineMode: generalSettings.offlineMode === "true",
        
        // AI settings
        aiModel: aiSettings.aiModel || "gpt-3.5-turbo",
        aiTemperature: parseFloat(aiSettings.aiTemperature || "0.7"),
        aiContextLength: parseInt(aiSettings.aiContextLength || "4000"),
        systemPromptPrefix: aiSettings.systemPromptPrefix || "",
        defaultUserCredits: parseInt(aiSettings.defaultUserCredits || "50"),
        creditCostPerArticle: parseInt(aiSettings.creditCostPerArticle || "10"),
        creditCostPerImage: parseInt(aiSettings.creditCostPerImage || "5"),
        
        // Email settings
        smtpServer: emailSettings.smtpServer || "",
        smtpPort: parseInt(emailSettings.smtpPort || "587"),
        smtpUsername: emailSettings.smtpUsername || "",
        smtpPassword: emailSettings.smtpPassword || "",
        emailSender: emailSettings.emailSender || "",
        appBaseUrl: emailSettings.appBaseUrl || "",
        
        // API integration settings
        openaiApiKey: apiSettings.openaiApiKey || "",
        claudeApiKey: apiSettings.claudeApiKey || "",
        wordpressApiUrl: apiSettings.wordpressApiUrl || "",
        wordpressApiUser: apiSettings.wordpressApiUser || "",
        wordpressApiKey: apiSettings.wordpressApiKey || "",
        
        // Webhook settings
        webhookSecret: integrationSettings.webhookSecret || "",
        notificationWebhookUrl: integrationSettings.notificationWebhookUrl || "",
        // Sử dụng notificationWebhookUrl thay cho webhook_url để thống nhất
        webhook_url: integrationSettings.notificationWebhookUrl || "",
        
        // Firebase settings
        firebaseApiKey: firebaseSettings.firebaseApiKey || "",
        firebaseProjectId: firebaseSettings.firebaseProjectId || "",
        firebaseAppId: firebaseSettings.firebaseAppId || "",
        enableGoogleAuth: firebaseSettings.enableGoogleAuth === "true",
        enableFacebookAuth: firebaseSettings.enableFacebookAuth === "true",
        
        // System info
        version: "1.0.0",
        lastBackup: generalSettings.lastBackup || "N/A",
        dbStatus: "online"
      };
      
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch admin settings' });
    }
  });
  
  // Admin settings API - General settings update
  app.patch('/api/admin/settings/general', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const { 
        siteName, 
        siteDescription, 
        contactEmail, 
        supportEmail,
        enableNewUsers,
        enableArticleCreation,
        enableAutoPublish,
        maintenanceMode,
        offlineMode
      } = req.body;
      
      console.log('General settings update request received:');
      console.log('- siteName:', siteName);
      console.log('- offlineMode:', offlineMode);
      
      // Update settings
      const updates = [
        storage.setSetting('siteName', siteName, 'general'),
        storage.setSetting('siteDescription', siteDescription, 'general'),
        storage.setSetting('contactEmail', contactEmail, 'general'),
        storage.setSetting('supportEmail', supportEmail, 'general'),
        storage.setSetting('enableNewUsers', enableNewUsers.toString(), 'general'),
        storage.setSetting('enableArticleCreation', enableArticleCreation.toString(), 'general'),
        storage.setSetting('enableAutoPublish', enableAutoPublish.toString(), 'general'),
        storage.setSetting('maintenanceMode', maintenanceMode.toString(), 'general'),
        storage.setSetting('offlineMode', offlineMode.toString(), 'general')
      ];
      
      await Promise.all(updates);
      
      // Xác nhận cài đặt đã được lưu
      const savedSettings = await storage.getSettingsByCategory('general');
      
      console.log('Verification after save:');
      console.log('- Saved siteName:', savedSettings.siteName);
      console.log('- Saved offlineMode:', savedSettings.offlineMode);
      
      res.json({ 
        success: true, 
        data: { 
          message: 'General settings updated successfully',
          settings: savedSettings
        } 
      });
    } catch (error) {
      console.error('Error updating general settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update general settings' });
    }
  });
  
  // Admin settings API - Webhook settings update
  app.patch('/api/admin/settings/webhook', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const { webhookSecret, notificationWebhookUrl } = req.body;
      console.log('Webhook settings update request received:');
      console.log('- notificationWebhookUrl:', notificationWebhookUrl);
      console.log('- webhookSecret provided:', webhookSecret !== undefined);
      
      let webhookUrlResult = true;
      let webhookSecretResult = true;
      
      // Update notification webhook URL if provided
      if (notificationWebhookUrl !== undefined) {
        webhookUrlResult = await storage.setSetting('notificationWebhookUrl', notificationWebhookUrl, 'integration');
        console.log('- notificationWebhookUrl update result:', webhookUrlResult);
      }
      
      // Update webhook secret if provided (now optional)
      if (webhookSecret !== undefined) {
        webhookSecretResult = await storage.setSetting('webhookSecret', webhookSecret, 'integration');
        console.log('- webhookSecret update result:', webhookSecretResult);
      }
      
      if (!webhookUrlResult || !webhookSecretResult) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save one or more webhook settings' 
        });
      }
      
      // Kiểm tra xem cài đặt đã được lưu thành công hay chưa
      const savedWebhookUrl = await storage.getSetting('notificationWebhookUrl');
      const savedWebhookSecret = await storage.getSetting('webhookSecret');
      
      console.log('Verification after save:');
      console.log('- Saved notificationWebhookUrl:', savedWebhookUrl);
      console.log('- Saved webhookSecret exists:', savedWebhookSecret !== null);
      
      res.json({ 
        success: true, 
        data: { 
          message: 'Webhook settings updated successfully',
          webhookUrl: savedWebhookUrl,
          webhookSecretExists: savedWebhookSecret !== null
        } 
      });
    } catch (error) {
      console.error('Error updating webhook settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update webhook settings' });
    }
  });

  // Get performance metrics for the admin dashboard
  app.get('/api/admin/performance', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const timeRange = req.query.timeRange || '24h';
      
      // In a real application, this would fetch actual data from monitoring systems
      // For now, we'll return mock data for demonstration purposes
      
      // Generate historical data points
      const now = new Date();
      const historyPoints = 24; // 24 hours of data
      
      const responseTimeHistory = Array.from({ length: historyPoints }, (_, i) => {
        const timestamp = new Date(now.getTime() - (historyPoints - 1 - i) * 3600000).toISOString();
        return {
          timestamp,
          average: 120 + Math.random() * 80,
          p95: 180 + Math.random() * 100,
          p99: 220 + Math.random() * 120,
        };
      });
      
      const requestsHistory = Array.from({ length: historyPoints }, (_, i) => {
        const timestamp = new Date(now.getTime() - (historyPoints - 1 - i) * 3600000).toISOString();
        return {
          timestamp,
          total: 1000 + Math.floor(Math.random() * 500),
          errors: Math.floor(Math.random() * 50),
        };
      });
      
      const resourceUsageHistory = Array.from({ length: historyPoints }, (_, i) => {
        const timestamp = new Date(now.getTime() - (historyPoints - 1 - i) * 3600000).toISOString();
        return {
          timestamp,
          cpu: 30 + Math.random() * 30,
          memory: 40 + Math.random() * 25,
          disk: 60 + Math.random() * 15,
        };
      });
      
      // Generate endpoint performance data
      const endpointPerformance = [
        { endpoint: "/api/articles", count: 5230, averageTime: 132, errorRate: 1.2 },
        { endpoint: "/api/user", count: 8450, averageTime: 88, errorRate: 0.8 },
        { endpoint: "/api/generate-content", count: 1820, averageTime: 2350, errorRate: 5.2 },
        { endpoint: "/api/admin/stats", count: 645, averageTime: 165, errorRate: 3.1 },
        { endpoint: "/api/plans", count: 1230, averageTime: 112, errorRate: 1.5 },
      ];
      
      res.json({
        success: true,
        data: {
          // Current stats
          averageResponseTime: 145,
          p95ResponseTime: 220,
          p99ResponseTime: 280,
          
          totalRequests: 24560,
          requestsPerMinute: 42,
          errorRate: 2.5,
          
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 72,
          
          // Historical data
          responseTimeHistory,
          requestsHistory,
          resourceUsageHistory,
          
          // Endpoint performance
          endpointPerformance,
        }
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch performance metrics' });
    }
  });

  return httpServer;
}
