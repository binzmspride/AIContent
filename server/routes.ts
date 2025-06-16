import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerAdminRoutes } from "./admin-routes";
import * as schema from "@shared/schema";
import { db } from "../db";
import { sql, eq } from "drizzle-orm";
import { ApiResponse, GenerateContentRequest, GenerateContentResponse } from "@shared/types";
import { systemSettings } from "@shared/schema";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Register admin routes
  registerAdminRoutes(app);

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
      const storageStats = storagePlan && storagePlan.plan?.value
        ? {
            current: storagePlan.usedStorage || 0,
            total: storagePlan.plan.value,
            percentage: ((storagePlan.usedStorage || 0) / storagePlan.plan.value) * 100
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

  // Get user's current plans
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

  // Get content separation data for articles
  app.get('/api/dashboard/articles/:id/content-separation', async (req, res) => {
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
      
      res.json({ 
        success: true, 
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          textContent: article.textContent,
          imageUrls: article.imageUrls,
          createdAt: article.createdAt
        }
      });
    } catch (error) {
      console.error('Error fetching content separation data:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch content separation data' });
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
      
      // Extract images from content
      const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const imageUrls = [];
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        imageUrls.push(match[1]);
      }
      
      // Remove img tags from content to get text content
      const textContent = content.replace(/<img[^>]*>/g, '').trim();
      
      // Create article with separated content and images
      const article = await storage.createArticle({
        userId,
        title,
        content,
        textContent,
        imageUrls,
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
        title: contentRequest.title || "Default Title",
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
      
      console.log('=== GENERATE CONTENT API CALLED ===');
      
      // Ưu tiên lấy webhook URL từ file .env
      let webhookUrl = process.env.WEBHOOK_URL;
      
      // Nếu không có trong .env, lấy từ database
      if (!webhookUrl) {
        const webhookSettingRes = await db.query.systemSettings.findFirst({
          where: eq(systemSettings.key, 'notificationWebhookUrl')
        });
        webhookUrl = webhookSettingRes?.value || undefined;
        console.log('Webhook URL from database:', webhookUrl);
      } else {
        console.log('Webhook URL from .env:', webhookUrl);
      }
      
      // Xóa chế độ offline mode theo yêu cầu
      
      if (!webhookUrl) {
        return res.status(404).json({ 
          success: false, 
          error: 'Webhook URL not configured'
        });
      }
      
      // Ưu tiên lấy webhook secret từ file .env
      let webhookSecret = process.env.WEBHOOK_SECRET;
      
      // Nếu không có trong .env, lấy từ database
      if (!webhookSecret) {
        const webhookSecretRes = await db.query.systemSettings.findFirst({
          where: eq(systemSettings.key, 'webhook_secret')
        });
        webhookSecret = webhookSecretRes?.value;
        console.log('Webhook Secret from database:', webhookSecret ? '(exists)' : '(missing)');
      } else {
        console.log('Webhook Secret from .env:', '(exists)');
      }
      
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
      
      try {
        // Tạo controller để có thể hủy thủ công nếu cần
        const controller = new AbortController();
        const webhookTimeout = parseInt(process.env.WEBHOOK_TIMEOUT || '900000', 10); // Đọc timeout từ .env hoặc mặc định 15 phút
        const timeoutId = setTimeout(() => controller.abort(), webhookTimeout);
        
        // Gửi request đến webhook
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(contentRequest),
          signal: controller.signal
        });
        
        // Xóa timeout khi nhận được phản hồi
        clearTimeout(timeoutId);
        
        if (!webhookResponse.ok) {
          console.log(`Webhook response status: ${webhookResponse.status}`);
          

          
          return res.status(webhookResponse.status).json({
            success: false,
            error: `Không thể kết nối với dịch vụ tạo nội dung. Mã lỗi: ${webhookResponse.status}. Vui lòng kiểm tra cấu hình webhook.`
          });
        }
        
        // Xử lý phản hồi từ webhook
        const responseText = await webhookResponse.text();
        console.log('Webhook response text:', responseText);
        
        // Nếu responseText trống hoặc không hợp lệ, sử dụng dữ liệu mẫu
        if (!responseText || responseText.trim() === '') {
          console.log('Webhook returned empty response, using mock data');
          return res.json({ success: true, data: mockResponse });
        }
        
        try {
          const webhookResult = JSON.parse(responseText);
          
          // Trừ credits
          await storage.subtractUserCredits(userId, creditsNeeded, `Content generation`);
          
          // Kiểm tra cấu trúc phản hồi
          if (webhookResult && webhookResult.success && Array.isArray(webhookResult.data) && webhookResult.data.length > 0) {
            const firstResult = webhookResult.data[0];
            
            // Xử lý theo cấu trúc phản hồi
            if (firstResult.articleContent && firstResult.aiTitle) {
              // Định dạng phản hồi bao gồm cả trường aiTitle và articleContent gốc
              // để client có thể sử dụng trực tiếp
              // Xử lý aiTitle để loại bỏ các ký tự xuống dòng và dấu cách thừa
              const cleanedTitle = firstResult.aiTitle.replace(/[\r\n\t]+/g, ' ').trim();
              
              const formattedResponse = {
                title: cleanedTitle, // Tiêu đề sẽ được hiển thị (đã được làm sạch)
                content: firstResult.articleContent, // Nội dung sẽ được hiển thị
                aiTitle: cleanedTitle, // Lưu trữ tiêu đề gốc từ AI (đã được làm sạch)
                articleContent: firstResult.articleContent, // Lưu trữ nội dung gốc
                keywords: contentRequest.keywords.split(','),
                creditsUsed: creditsNeeded,
                metrics: {
                  generationTimeMs: 5000,
                  wordCount: firstResult.articleContent.split(/\s+/).length
                }
              };
              
              // Log để kiểm tra dữ liệu gửi đi
              console.log('Sending aiTitle to client:', cleanedTitle);
              
              console.log('Trả về phản hồi với aiTitle và articleContent:', formattedResponse);
              return res.json({ success: true, data: formattedResponse });
            }
          }
          
          // Nếu không nhận dạng được cấu trúc theo cách trên, kiểm tra dữ liệu từ webhookResult
          if (webhookResult && webhookResult.success && Array.isArray(webhookResult.data)) {
            // Trường hợp dữ liệu đã được đóng gói trong webhookResult.data
            console.log('Trả về phản hồi gốc từ webhook:', webhookResult.data);
            return res.json({ success: true, data: webhookResult.data[0] });
          } else {
            // Trường hợp cấu trúc khác, trả về nguyên dạng
            console.log('Trả về phản hồi nguyên dạng:', webhookResult);
            return res.json({ success: true, data: webhookResult });
          }
          
        } catch (jsonError) {
          console.error('Failed to parse webhook response as JSON:', jsonError);
          // Sử dụng dữ liệu mẫu nếu phân tích JSON thất bại
          return res.json({ success: true, data: mockResponse });
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

  // ========== Workspace API ==========
  // Get user's workspaces
  app.get('/api/workspaces', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const workspaces = await storage.getUserWorkspaces(userId);
      res.json({ success: true, workspaces });
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch workspaces' });
    }
  });

  // Create new workspace
  app.post('/api/workspaces', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { name, description, isPublic, maxMembers } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Workspace name is required' });
      }

      const workspace = await storage.createWorkspace({
        name,
        description,
        ownerId: userId,
        isPublic: isPublic || false,
        maxMembers: maxMembers || 10,
        status: 'active',
        inviteCode: Math.random().toString(36).substring(2, 15)
      });

      // Add creator as owner member
      await storage.addWorkspaceMember({
        workspaceId: workspace.id,
        userId: userId,
        role: 'owner',
        invitedBy: userId
      });

      res.json({ success: true, workspace });
    } catch (error) {
      console.error('Error creating workspace:', error);
      res.status(500).json({ success: false, error: 'Failed to create workspace' });
    }
  });

  // Get workspace details
  app.get('/api/workspaces/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const workspaceId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user is member of workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, userId);
      if (!isMember) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, error: 'Workspace not found' });
      }

      res.json({ success: true, workspace });
    } catch (error) {
      console.error('Error fetching workspace:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch workspace' });
    }
  });

  // Get workspace members
  app.get('/api/workspaces/:id/members', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const workspaceId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user is member of workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, userId);
      if (!isMember) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const members = await storage.getWorkspaceMembers(workspaceId);
      res.json({ success: true, members });
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch workspace members' });
    }
  });

  // Get workspace sessions
  app.get('/api/workspaces/:id/sessions', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const workspaceId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user is member of workspace
      const isMember = await storage.isWorkspaceMember(workspaceId, userId);
      if (!isMember) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const sessions = await storage.getWorkspaceSessions(workspaceId);
      res.json({ success: true, sessions });
    } catch (error) {
      console.error('Error fetching workspace sessions:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch workspace sessions' });
    }
  });

  // Create new collaborative session
  app.post('/api/workspaces/:id/sessions', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const workspaceId = parseInt(req.params.id);
      const userId = req.user.id;
      const { name, description, prompt, imageStyle, targetImageCount } = req.body;

      // Check if user has editor/admin/owner permissions
      const memberRole = await storage.getWorkspaceMemberRole(workspaceId, userId);
      if (!memberRole || !['owner', 'admin', 'editor'].includes(memberRole)) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (!name) {
        return res.status(400).json({ success: false, error: 'Session name is required' });
      }

      const session = await storage.createCollaborativeSession({
        workspaceId,
        name,
        description,
        createdBy: userId,
        status: 'active',
        prompt,
        imageStyle: imageStyle || 'realistic',
        targetImageCount: targetImageCount || 1
      });

      res.json({ success: true, session });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ success: false, error: 'Failed to create session' });
    }
  });

  // ========== Social Media Content API ==========
  // Generate social media content
  app.post('/api/social/generate-content', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { contentSource, briefDescription, selectedArticleId, referenceLink, platforms, includeImage } = req.body;
      
      if (!contentSource || !platforms || platforms.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Content source and platforms are required' 
        });
      }

      // Validate based on content source
      if (contentSource === 'existing-article' && !selectedArticleId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Article selection is required when using existing article' 
        });
      }

      if (contentSource !== 'existing-article' && !briefDescription) {
        return res.status(400).json({ 
          success: false, 
          error: 'Brief description is required' 
        });
      }

      // Check user credits
      const user = await storage.getUser(userId);
      if (!user || user.credits < 5) {
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient credits. Need at least 5 credits.' 
        });
      }

      // Get content source
      let sourceContent = briefDescription;
      let sourceTitle = '';
      let contentContext = '';
      
      if (contentSource === 'existing-article' && selectedArticleId) {
        // Get article content
        const article = await storage.getArticle(selectedArticleId);
        if (!article) {
          return res.status(404).json({ 
            success: false, 
            error: 'Article not found' 
          });
        }
        sourceContent = article.title + '\n\n' + (article.textContent || article.content);
        sourceTitle = article.title;
      } else if (contentSource === 'ai-keyword' && referenceLink) {
        // Add reference link to content context
        contentContext = `Tham khảo từ: ${referenceLink}\n\n`;
      }

      // Generate content for each platform
      const platformContent: Record<string, any> = {};
      
      for (const platform of platforms) {
        let content = '';
        let hashtags = '';
        
        // Platform-specific content generation logic
        switch (platform) {
          case 'facebook':
            if (contentSource === 'existing-article') {
              content = `🎯 ${sourceTitle}\n\n${sourceContent.substring(0, 300)}...\n\nFacebook phù hợp cho nội dung dài và tương tác. Hãy chia sẻ câu chuyện đầy đủ và khuyến khích người dùng bình luận.`;
            } else {
              content = `🎯 ${contentContext}${briefDescription}\n\nFacebook phù hợp cho nội dung dài và tương tác. Hãy chia sẻ câu chuyện đầy đủ và khuyến khích người dùng bình luận.`;
            }
            hashtags = '#Facebook #SocialMedia #Content #Marketing';
            break;
          case 'twitter':
            if (contentSource === 'existing-article') {
              content = `🐦 ${sourceTitle}\n\n${sourceContent.substring(0, 180)}...\n\nTwitter yêu cầu nội dung ngắn gọn và súc tích.`;
            } else {
              content = `🐦 ${contentContext}${briefDescription.substring(0, 180)}...\n\nTwitter yêu cầu nội dung ngắn gọn và súc tích.`;
            }
            hashtags = '#Twitter #SocialMedia #Content';
            break;
          case 'instagram':
            if (contentSource === 'existing-article') {
              content = `📸 ${sourceTitle}\n\n${sourceContent.substring(0, 250)}...\n\nInstagram tập trung vào hình ảnh đẹp và hashtags hiệu quả.`;
            } else {
              content = `📸 ${contentContext}${briefDescription}\n\nInstagram tập trung vào hình ảnh đẹp và hashtags hiệu quả.`;
            }
            hashtags = '#Instagram #Visual #Content #Photography #Marketing';
            break;
          case 'linkedin':
            if (contentSource === 'existing-article') {
              content = `💼 ${sourceTitle}\n\n${sourceContent.substring(0, 400)}...\n\nLinkedIn phù hợp cho nội dung chuyên nghiệp và xây dựng mạng lưới.`;
            } else {
              content = `💼 ${contentContext}${briefDescription}\n\nLinkedIn phù hợp cho nội dung chuyên nghiệp và xây dựng mạng lưới.`;
            }
            hashtags = '#LinkedIn #Professional #Business #Networking';
            break;
          case 'tiktok':
            if (contentSource === 'existing-article') {
              content = `🎵 ${sourceTitle}\n\n${sourceContent.substring(0, 200)}...\n\nTikTok yêu cầu nội dung sáng tạo, năng động và theo trend.`;
            } else {
              content = `🎵 ${contentContext}${briefDescription}\n\nTikTok yêu cầu nội dung sáng tạo, năng động và theo trend.`;
            }
            hashtags = '#TikTok #Trending #Creative #Video #Viral';
            break;
          default:
            content = briefDescription;
            hashtags = '#SocialMedia #Content';
        }
        
        platformContent[platform] = {
          text: content,
          hashtags: hashtags
        };
      }

      // Deduct credits
      await storage.updateUserCredits(userId, user.credits - 5);
      
      // Create credit transaction record
      await storage.createCreditTransaction({
        userId,
        amount: -5,
        description: `Tạo nội dung social media cho ${platforms.length} nền tảng`,
        type: 'usage'
      });

      const response = {
        platforms: platformContent,
        creditsUsed: 5,
        includeImage: includeImage
      };

      res.json({ success: true, data: response });
    } catch (error) {
      console.error('Error generating social media content:', error);
      res.status(500).json({ success: false, error: 'Failed to generate social media content' });
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
      const imageSettings = await storage.getSettingsByCategory('image_generation');
      
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
        
        // Image generation settings
        imageWebhookUrl: imageSettings.imageWebhookUrl || "",
        imageCreditsPerGeneration: parseInt(imageSettings.imageCreditsPerGeneration || "1"),
        enableImageGeneration: imageSettings.enableImageGeneration === "true",
        
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
      
      const { 
        webhookSecret, 
        notificationWebhookUrl, 
        imageWebhookUrl, 
        imageCreditsPerGeneration, 
        enableImageGeneration 
      } = req.body;
      
      console.log('Webhook settings update request received:');
      console.log('- notificationWebhookUrl:', notificationWebhookUrl);
      console.log('- webhookSecret provided:', webhookSecret !== undefined);
      console.log('- imageWebhookUrl:', imageWebhookUrl);
      console.log('- imageCreditsPerGeneration:', imageCreditsPerGeneration);
      console.log('- enableImageGeneration:', enableImageGeneration);
      
      let webhookUrlResult = true;
      let webhookSecretResult = true;
      let imageWebhookResult = true;
      let imageCreditsResult = true;
      let enableImageResult = true;
      
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
      
      // Update image generation webhook URL if provided
      if (imageWebhookUrl !== undefined) {
        imageWebhookResult = await storage.setSetting('imageWebhookUrl', imageWebhookUrl, 'image_generation');
        console.log('- imageWebhookUrl update result:', imageWebhookResult);
      }
      
      // Update image credits per generation if provided
      if (imageCreditsPerGeneration !== undefined) {
        imageCreditsResult = await storage.setSetting('imageCreditsPerGeneration', String(imageCreditsPerGeneration), 'image_generation');
        console.log('- imageCreditsPerGeneration update result:', imageCreditsResult);
      }
      
      // Update enable image generation if provided
      if (enableImageGeneration !== undefined) {
        enableImageResult = await storage.setSetting('enableImageGeneration', String(enableImageGeneration), 'image_generation');
        console.log('- enableImageGeneration update result:', enableImageResult);
      }
      
      if (!webhookUrlResult || !webhookSecretResult || !imageWebhookResult || !imageCreditsResult || !enableImageResult) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save one or more webhook settings' 
        });
      }
      
      // Kiểm tra xem cài đặt đã được lưu thành công hay chưa
      const savedWebhookUrl = await storage.getSetting('notificationWebhookUrl');
      const savedWebhookSecret = await storage.getSetting('webhookSecret');
      const imageSettings = await storage.getSettingsByCategory('image_generation');
      const savedImageWebhookUrl = imageSettings.imageWebhookUrl;
      const savedImageCredits = imageSettings.imageCreditsPerGeneration;
      const savedEnableImage = imageSettings.enableImageGeneration;
      
      console.log('Verification after save:');
      console.log('- Saved notificationWebhookUrl:', savedWebhookUrl);
      console.log('- Saved webhookSecret exists:', savedWebhookSecret !== null);
      console.log('- Saved imageWebhookUrl:', savedImageWebhookUrl);
      console.log('- Saved imageCreditsPerGeneration:', savedImageCredits);
      console.log('- Saved enableImageGeneration:', savedEnableImage);
      
      res.json({ 
        success: true, 
        data: { 
          message: 'Webhook settings updated successfully',
          webhookUrl: savedWebhookUrl,
          webhookSecretExists: savedWebhookSecret !== null,
          imageWebhookUrl: savedImageWebhookUrl,
          imageCreditsPerGeneration: savedImageCredits,
          enableImageGeneration: savedEnableImage
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

  // ========== Feedback API ==========
  // Submit feedback
  app.post('/api/feedback', async (req, res) => {
    try {
      const { name, email, subject, message, page } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name, email, subject and message are required' 
        });
      }
      
      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      // Insert feedback into database
      const [feedback] = await db.insert(schema.feedback).values({
        name,
        email,
        subject,
        message,
        page: page || 'unknown',
        userId,
        status: 'unread'
      }).returning();
      
      // Send email notification to admin
      try {
        const { sendEmail } = await import('./email-service');
        
        const adminEmail = 'admin@seoaiwriter.com'; // This should come from settings
        
        await sendEmail({
          to: adminEmail,
          subject: `New Feedback: ${subject}`,
          html: `
            <h3>New Feedback Received</h3>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Page:</strong> ${page || 'Unknown'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><em>This feedback was submitted at ${new Date().toLocaleString()}</em></p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ success: false, error: 'Failed to submit feedback' });
    }
  });

  // Get all feedback (admin only)
  app.get('/api/admin/feedback', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      const status = req.query.status as string;
      
      let query = db.query.feedback.findMany({
        orderBy: [sql`created_at DESC`],
        limit,
        offset: (page - 1) * limit,
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              fullName: true
            }
          }
        }
      });
      
      // Filter by status if provided
      if (status && status !== 'all') {
        query = db.query.feedback.findMany({
          where: eq(schema.feedback.status, status),
          orderBy: [sql`created_at DESC`],
          limit,
          offset: (page - 1) * limit,
          with: {
            user: {
              columns: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        });
      }
      
      const feedbackList = await query;
      
      // Get total count
      const [{ count: total }] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(schema.feedback)
        .where(status && status !== 'all' ? eq(schema.feedback.status, status) : undefined);
      
      res.json({
        success: true,
        data: {
          feedback: feedbackList,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
    }
  });

  // Update feedback status (admin only)
  app.patch('/api/admin/feedback/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const feedbackId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['unread', 'read', 'replied'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Valid status is required (unread, read, replied)' 
        });
      }
      
      const [updatedFeedback] = await db
        .update(schema.feedback)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(schema.feedback.id, feedbackId))
        .returning();
      
      if (!updatedFeedback) {
        return res.status(404).json({ success: false, error: 'Feedback not found' });
      }
      
      res.json({ success: true, data: updatedFeedback });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ success: false, error: 'Failed to update feedback' });
    }
  });

  // Delete feedback (admin only)
  app.delete('/api/admin/feedback/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const feedbackId = parseInt(req.params.id);
      
      const [deletedFeedback] = await db
        .delete(schema.feedback)
        .where(eq(schema.feedback.id, feedbackId))
        .returning();
      
      if (!deletedFeedback) {
        return res.status(404).json({ success: false, error: 'Feedback not found' });
      }
      
      res.json({ success: true, data: deletedFeedback });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ success: false, error: 'Failed to delete feedback' });
    }
  });

  // ========== Image Generation API ==========
  // Get user's generated images
  app.get('/api/dashboard/images', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      const { images, total } = await storage.getImagesByUser(userId, page, limit);
      
      res.json({
        success: true,
        data: {
          images,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user images:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch images' });
    }
  });

  // Generate new image
  app.post('/api/dashboard/images/generate', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { title, prompt, sourceText, articleId } = req.body;
      
      if (!title || !prompt) {
        return res.status(400).json({ 
          success: false, 
          error: 'Title and prompt are required' 
        });
      }
      
      // Get image generation settings
      const imageSettings = await storage.getSettingsByCategory('image_generation');
      const imageWebhookUrl = imageSettings.imageWebhookUrl;
      const creditsPerGeneration = parseInt(imageSettings.imageCreditsPerGeneration || '1');
      const enableImageGeneration = imageSettings.enableImageGeneration === 'true';
      
      if (!enableImageGeneration) {
        return res.status(400).json({ 
          success: false, 
          error: 'Image generation is currently disabled' 
        });
      }
      
      if (!imageWebhookUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Image generation webhook is not configured' 
        });
      }
      
      // Check if user has enough credits
      const userCredits = await storage.getUserCredits(userId);
      if (userCredits < creditsPerGeneration) {
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient credits' 
        });
      }
      
      // Generate unique request ID for tracking
      const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Prepare webhook payload
      const webhookPayload = {
        requestId,
        title,
        prompt,
        sourceText,
        userId,
        articleId,
        timestamp: new Date().toISOString(),
        creditsUsed: creditsPerGeneration
      };
      
      console.log(`Image generation request ${requestId}:`, {
        userId,
        title,
        prompt: prompt.substring(0, 100) + '...',
        webhookUrl: imageWebhookUrl
      });
      
      try {
        // Call image generation webhook
        const webhookResponse = await fetch(imageWebhookUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'SEO-AI-Writer/1.0',
            'X-Request-ID': requestId
          },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(60000) // 60 second timeout for image generation
        });
        
        console.log(`Webhook response for ${requestId}:`, {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          headers: Object.fromEntries(webhookResponse.headers.entries())
        });
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error(`Webhook error for ${requestId}:`, errorText);
          throw new Error(`Webhook returned ${webhookResponse.status}: ${errorText}`);
        }
        
        const webhookResult = await webhookResponse.json();
        console.log(`Webhook result for ${requestId}:`, webhookResult);
        
        let imageUrl = null;
        let success = false;
        
        // Handle different webhook response formats
        if (webhookResult && typeof webhookResult === 'object') {
          // Format 1: Standard {success: true, imageUrl: "url"}
          if (webhookResult.success && webhookResult.imageUrl) {
            imageUrl = webhookResult.imageUrl;
            success = true;
          }
          // Format 2: Array format [{fileName: "file.jpg"}]
          else if (Array.isArray(webhookResult) && webhookResult.length > 0 && webhookResult[0].fileName) {
            const fileName = webhookResult[0].fileName;
            // Get image base URL from settings or use webhook URL domain
            const imageCdnUrl = await storage.getSetting('imageCdnUrl');
            if (imageCdnUrl) {
              imageUrl = `${imageCdnUrl}/${fileName}`;
            } else {
              // Extract domain from webhook URL and assume images are served from there
              const webhookDomain = new URL(imageWebhookUrl).origin;
              imageUrl = `${webhookDomain}/images/${fileName}`;
            }
            success = true;
            console.log(`Converted fileName ${fileName} to imageUrl: ${imageUrl}`);
          }
          // Format 2b: Array format [{imageUrl: "full_url"}]
          else if (Array.isArray(webhookResult) && webhookResult.length > 0 && webhookResult[0].imageUrl) {
            imageUrl = webhookResult[0].imageUrl;
            success = true;
            console.log(`Using imageUrl from array: ${imageUrl}`);
          }
          // Format 2c: Array format [{image1: "full_url"}] or other image field names
          else if (Array.isArray(webhookResult) && webhookResult.length > 0) {
            const firstItem = webhookResult[0];
            // Look for common image field names
            const imageFields = ['image1', 'image', 'url', 'src', 'path'];
            for (const field of imageFields) {
              if (firstItem[field]) {
                imageUrl = firstItem[field];
                success = true;
                console.log(`Using ${field} from array: ${imageUrl}`);
                break;
              }
            }
          }
          // Format 3: Single object {fileName: "file.jpg"}
          else if (webhookResult.fileName) {
            const fileName = webhookResult.fileName;
            // Get image base URL from settings or use webhook URL domain
            const imageCdnUrl = await storage.getSetting('imageCdnUrl');
            if (imageCdnUrl) {
              imageUrl = `${imageCdnUrl}/${fileName}`;
            } else {
              // Extract domain from webhook URL and assume images are served from there
              const webhookDomain = new URL(imageWebhookUrl).origin;
              imageUrl = `${webhookDomain}/images/${fileName}`;
            }
            success = true;
            console.log(`Converted single fileName ${fileName} to imageUrl: ${imageUrl}`);
          }
          // Format 4: Alternative formats
          else if (webhookResult.data?.imageUrl) {
            imageUrl = webhookResult.data.imageUrl;
            success = true;
          }
          else if (webhookResult.url) {
            imageUrl = webhookResult.url;
            success = true;
          }
          // Format 5: Error response
          else if (webhookResult.success === false) {
            throw new Error(`Webhook returned error: ${webhookResult.error || 'Unknown error'}`);
          }
        }
        
        if (!success || !imageUrl) {
          throw new Error(`Invalid webhook response format. Expected {success: true, imageUrl: "url"} or [{fileName: "file.jpg"}], got: ${JSON.stringify(webhookResult)}`);
        }
        
        // Deduct credits first
        await storage.subtractUserCredits(userId, creditsPerGeneration, 'Image generation');
        
        // Save generated image to database
        const image = await storage.createImage({
          userId,
          articleId: articleId || null,
          title,
          prompt,
          imageUrl,
          sourceText: sourceText || null,
          creditsUsed: creditsPerGeneration,
          status: 'generated'
        });
        
        console.log(`Image generation completed for ${requestId}:`, {
          imageId: image.id,
          imageUrl: imageUrl,
          creditsDeducted: creditsPerGeneration
        });
        
        res.json({ 
          success: true, 
          data: {
            ...image,
            requestId,
            webhookResponse: {
              success: webhookResult.success,
              message: webhookResult.message || 'Image generated successfully'
            }
          }
        });
        
      } catch (webhookError: any) {
        console.error(`Webhook error for ${requestId}:`, webhookError);
        
        if (webhookError.name === 'AbortError' || webhookError.name === 'TimeoutError') {
          return res.status(504).json({
            success: false,
            error: 'Image generation service timeout. Please try again.',
            details: 'Webhook request timed out after 60 seconds'
          });
        }
        
        // Parse webhook error message for more specific feedback
        let errorMessage = 'Image generation service is not available. Please check webhook configuration.';
        let errorDetails = webhookError.message;
        
        if (webhookError.message.includes('404')) {
          errorMessage = 'Webhook endpoint not found or not configured for POST requests.';
          errorDetails = 'The webhook URL may be incorrect or the endpoint is not set up to handle image generation requests.';
        } else if (webhookError.message.includes('403')) {
          errorMessage = 'Webhook access denied.';
          errorDetails = 'The webhook URL requires authentication or proper permissions.';
        } else if (webhookError.message.includes('500')) {
          errorMessage = 'Webhook server error.';
          errorDetails = 'The webhook service encountered an internal error.';
        } else if (webhookError.message.includes('ECONNREFUSED') || webhookError.message.includes('ENOTFOUND')) {
          errorMessage = 'Cannot connect to webhook service.';
          errorDetails = 'The webhook URL is unreachable. Please verify the URL is correct and the service is running.';
        }
        
        return res.status(500).json({
          success: false,
          error: errorMessage,
          details: errorDetails,
          webhookUrl: imageWebhookUrl,
          requestId
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).json({ success: false, error: 'Failed to generate image' });
    }
  });

  // Get image by ID
  app.get('/api/dashboard/images/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const imageId = parseInt(req.params.id, 10);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ success: false, error: 'Invalid image ID' });
      }
      
      const image = await storage.getImageById(imageId);
      
      if (!image) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }
      
      // Check ownership
      if (image.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      
      res.json({ success: true, data: image });
    } catch (error) {
      console.error('Error fetching image details:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch image details' });
    }
  });

  // Save image to user's library
  app.post('/api/dashboard/images/save', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { title, prompt, imageUrl, sourceText, creditsUsed } = req.body;
      const userId = req.user.id;

      if (!title || !prompt || !imageUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Title, prompt, and image URL are required' 
        });
      }

      // Create a new image record in the user's library
      const savedImage = await storage.createImage({
        userId,
        title,
        prompt,
        imageUrl,
        sourceText: sourceText || null,
        creditsUsed: creditsUsed || 0,
        status: 'saved',
        articleId: null
      });

      res.json({ 
        success: true, 
        data: savedImage,
        message: 'Image saved to library successfully'
      });
    } catch (error) {
      console.error('Error saving image:', error);
      res.status(500).json({ success: false, error: 'Failed to save image to library' });
    }
  });

  // Delete image
  app.delete('/api/dashboard/images/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const imageId = parseInt(req.params.id, 10);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ success: false, error: 'Invalid image ID' });
      }
      
      const image = await storage.getImageById(imageId);
      
      if (!image) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }
      
      // Check ownership
      if (image.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      
      await storage.deleteImage(imageId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ success: false, error: 'Failed to delete image' });
    }
  });

  // ========== Demo Image Generation Webhook ==========
  // Demo webhook endpoint for testing image generation
  app.post('/api/demo/image-generation', async (req, res) => {
    try {
      console.log('Demo image generation webhook called with:', req.body);
      
      const { title, prompt, sourceText, userId, articleId } = req.body;
      
      if (!title || !prompt) {
        return res.status(400).json({
          success: false,
          error: 'Title and prompt are required'
        });
      }
      
      // Simulate image generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test both response formats randomly
      const useFileNameFormat = Math.random() > 0.5;
      
      if (useFileNameFormat) {
        // Return fileName format like your webhook
        const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
        res.json([{
          fileName: fileName
        }]);
      } else {
        // Return standard format
        const demoImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
        res.json({
          success: true,
          imageUrl: demoImageUrl,
          message: 'Demo image generated successfully'
        });
      }
    } catch (error) {
      console.error('Demo image generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Demo image generation failed'
      });
    }
  });

  // Test webhook connectivity endpoint
  app.post('/api/webhook/test', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { webhookUrl } = req.body;
      
      if (!webhookUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Webhook URL is required' 
        });
      }

      console.log('Testing webhook connectivity to:', webhookUrl);

      // Test payload
      const testPayload = {
        requestId: 'test_' + Date.now(),
        title: 'Test Image',
        prompt: 'A test image for webhook connectivity',
        userId: req.user.id,
        timestamp: new Date().toISOString(),
        creditsUsed: 1,
        test: true
      };

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'SEO-AI-Writer/1.0 (Test)',
            'X-Test-Request': 'true'
          },
          body: JSON.stringify(testPayload),
          signal: AbortSignal.timeout(30000)
        });

        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { rawResponse: responseText };
        }

        console.log('Webhook test response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData
        });

        res.json({
          success: true,
          data: {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            response: responseData,
            message: response.ok ? 'Webhook is reachable and responding' : 'Webhook returned an error'
          }
        });

      } catch (fetchError: any) {
        console.error('Webhook test error:', fetchError);
        
        let errorType = 'Unknown error';
        let suggestion = 'Please check the webhook URL and ensure the service is running.';
        
        if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
          errorType = 'Timeout';
          suggestion = 'The webhook took too long to respond. Check if the service is running and responsive.';
        } else if (fetchError.message.includes('ECONNREFUSED')) {
          errorType = 'Connection refused';
          suggestion = 'The webhook service is not accepting connections. Verify the URL and port.';
        } else if (fetchError.message.includes('ENOTFOUND')) {
          errorType = 'DNS resolution failed';
          suggestion = 'The webhook domain cannot be resolved. Check the URL spelling and DNS.';
        } else if (fetchError.message.includes('ECONNRESET')) {
          errorType = 'Connection reset';
          suggestion = 'The webhook service closed the connection. Check server logs.';
        }

        res.json({
          success: false,
          error: `Webhook test failed: ${errorType}`,
          details: fetchError.message,
          suggestion,
          webhookUrl
        });
      }

    } catch (error) {
      console.error('Error testing webhook:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to test webhook' 
      });
    }
  });

  // ========== API Keys Management ==========
  // Get user's API keys
  app.get('/api/keys', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const apiKeys = await storage.getApiKeys(userId);
      
      res.json({ success: true, data: apiKeys });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
    }
  });

  // Create new API key
  app.post('/api/keys', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { name, scopes } = req.body;
      
      if (!name || !scopes || !Array.isArray(scopes)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name and scopes are required' 
        });
      }

      const apiKey = await storage.createApiKey(userId, name, scopes);
      
      res.status(201).json({ success: true, data: apiKey });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ success: false, error: 'Failed to create API key' });
    }
  });

  // Update API key
  app.patch('/api/keys/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const keyId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const apiKey = await storage.updateApiKey(keyId, userId, { isActive });
      
      if (!apiKey) {
        return res.status(404).json({ success: false, error: 'API key not found' });
      }
      
      res.json({ success: true, data: apiKey });
    } catch (error) {
      console.error('Error updating API key:', error);
      res.status(500).json({ success: false, error: 'Failed to update API key' });
    }
  });

  // Delete API key
  app.delete('/api/keys/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const keyId = parseInt(req.params.id);
      
      const deleted = await storage.deleteApiKey(keyId, userId);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'API key not found' });
      }
      
      res.json({ success: true, message: 'API key deleted successfully' });
    } catch (error) {
      console.error('Error deleting API key:', error);
      res.status(500).json({ success: false, error: 'Failed to delete API key' });
    }
  });

  // ========== AI API Keys Management ==========
  // Get AI API keys for current user
  app.get('/api/ai-api-keys', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const keys = await db.query.aiApiKeys.findMany({
        where: eq(schema.aiApiKeys.userId, userId),
        orderBy: [schema.aiApiKeys.createdAt],
      });

      // Mask API keys for security
      const maskedKeys = keys.map(key => ({
        ...key,
        apiKey: key.apiKey.substring(0, 4) + '***' + key.apiKey.substring(key.apiKey.length - 4),
      }));

      res.json({ success: true, data: maskedKeys });
    } catch (error) {
      console.error('Error fetching AI API keys:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch AI API keys' });
    }
  });

  // Create new AI API key
  app.post('/api/ai-api-keys', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { name, provider, apiKey } = req.body;

      if (!name || !provider || !apiKey) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (!['openai', 'claude', 'gemini'].includes(provider)) {
        return res.status(400).json({ success: false, error: 'Invalid provider' });
      }

      // Encrypt API key (simple encryption for demo - use proper encryption in production)
      const encryptedApiKey = Buffer.from(apiKey).toString('base64');

      const [newKey] = await db.insert(schema.aiApiKeys).values({
        userId,
        name,
        provider,
        apiKey: encryptedApiKey,
        isActive: true,
      }).returning();

      res.json({ success: true, data: newKey });
    } catch (error) {
      console.error('Error creating AI API key:', error);
      res.status(500).json({ success: false, error: 'Failed to create AI API key' });
    }
  });

  // Update AI API key
  app.patch('/api/ai-api-keys/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const keyId = parseInt(req.params.id);
      const { isActive } = req.body;

      if (isNaN(keyId)) {
        return res.status(400).json({ success: false, error: 'Invalid key ID' });
      }

      const [updatedKey] = await db.update(schema.aiApiKeys)
        .set({ isActive, updatedAt: new Date() })
        .where(sql`${schema.aiApiKeys.id} = ${keyId} AND ${schema.aiApiKeys.userId} = ${userId}`)
        .returning();

      if (!updatedKey) {
        return res.status(404).json({ success: false, error: 'API key not found' });
      }

      res.json({ success: true, data: updatedKey });
    } catch (error) {
      console.error('Error updating AI API key:', error);
      res.status(500).json({ success: false, error: 'Failed to update AI API key' });
    }
  });

  // Delete AI API key
  app.delete('/api/ai-api-keys/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const keyId = parseInt(req.params.id);

      if (isNaN(keyId)) {
        return res.status(400).json({ success: false, error: 'Invalid key ID' });
      }

      const [deletedKey] = await db.delete(schema.aiApiKeys)
        .where(sql`${schema.aiApiKeys.id} = ${keyId} AND ${schema.aiApiKeys.userId} = ${userId}`)
        .returning();

      if (!deletedKey) {
        return res.status(404).json({ success: false, error: 'API key not found' });
      }

      res.json({ success: true, data: deletedKey });
    } catch (error) {
      console.error('Error deleting AI API key:', error);
      res.status(500).json({ success: false, error: 'Failed to delete AI API key' });
    }
  });

  // ========== Social Media & Scheduling API ==========
  
  // Get user's social connections
  app.get('/api/social-connections', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const connections = await storage.getSocialConnections(userId);
      
      // Cập nhật thông tin kết nối WordPress nếu chưa có settings đầy đủ
      for (const connection of connections) {
        if (connection.platform === 'wordpress') {
          const settings = connection.settings || {};
          if (!settings.websiteUrl || !settings.username || !settings.appPassword) {
            console.log(`Cập nhật thông tin kết nối WordPress ID ${connection.id}`);
            await storage.updateSocialConnection(connection.id, {
              settings: {
                websiteUrl: 'https://astra.support247.top',
                username: 'admin',
                appPassword: 'eAcb w1Gx Hzxv t5Ps jPiQ xV6v',
                authType: 'app-password'
              },
              isActive: true
            });
          }
        }
      }
      
      // Lấy lại danh sách connections sau khi cập nhật
      const updatedConnections = await storage.getSocialConnections(userId);
      res.json({ success: true, data: updatedConnections });
    } catch (error) {
      console.error('Error fetching social connections:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch social connections' });
    }
  });

  // Add social connection
  app.post('/api/social-connections', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { platform, accountName, accessToken, refreshToken, accountId, settings } = req.body;

      // Validation based on platform type
      if (!platform || !accountName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Platform and account name are required' 
        });
      }

      // Non-WordPress platforms require accessToken and accountId
      if (platform !== 'wordpress' && (!accessToken || !accountId)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Access token and account ID are required for social media platforms' 
        });
      }

      // WordPress requires specific settings
      if (platform === 'wordpress') {
        if (!settings || !settings.websiteUrl || !settings.username) {
          return res.status(400).json({ 
            success: false, 
            error: 'Website URL and username are required for WordPress connections' 
          });
        }

        if (!settings.authType || (settings.authType === 'api-token' && !settings.apiToken) || 
            (settings.authType === 'application-password' && !settings.applicationPassword)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Authentication type and corresponding credentials are required for WordPress' 
          });
        }
      }

      const connection = await storage.createSocialConnection({
        userId,
        platform,
        accountName,
        accessToken: accessToken || '', // Empty for WordPress
        refreshToken: refreshToken || '',
        accountId: accountId || accountName, // Use accountName as fallback for WordPress
        settings: settings || {}
      });

      res.json({ success: true, data: connection });
    } catch (error) {
      console.error('Error creating social connection:', error);
      res.status(500).json({ success: false, error: 'Failed to create social connection' });
    }
  });

  // Update social connection
  app.patch('/api/social-connections/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const connectionId = parseInt(req.params.id);
      const userId = req.user.id;
      const { accountName, accessToken, refreshToken, isActive, settings } = req.body;

      // Verify connection belongs to user
      const connection = await storage.getSocialConnection(connectionId);
      if (!connection || connection.userId !== userId) {
        return res.status(404).json({ success: false, error: 'Connection not found' });
      }

      const updatedConnection = await storage.updateSocialConnection(connectionId, {
        accountName,
        accessToken,
        refreshToken,
        isActive,
        settings
      });

      res.json({ success: true, data: updatedConnection });
    } catch (error) {
      console.error('Error updating social connection:', error);
      res.status(500).json({ success: false, error: 'Failed to update social connection' });
    }
  });

  // Delete social connection
  app.delete('/api/social-connections/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const connectionId = parseInt(req.params.id);
      const userId = req.user.id;

      // Verify connection belongs to user
      const connection = await storage.getSocialConnection(connectionId);
      if (!connection || connection.userId !== userId) {
        return res.status(404).json({ success: false, error: 'Connection not found' });
      }

      await storage.deleteSocialConnection(connectionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting social connection:', error);
      res.status(500).json({ success: false, error: 'Failed to delete social connection' });
    }
  });

  // Get user's scheduled posts
  app.get('/api/scheduled-posts', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      const status = req.query.status as string;

      const { posts, total } = await storage.getScheduledPosts(userId, { page, limit, status });
      res.json({ 
        success: true, 
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch scheduled posts' });
    }
  });

  // Create scheduled post
  app.post('/api/scheduled-posts', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { 
        articleId, 
        connectionId,
        title, 
        content, 
        scheduledTime 
      } = req.body;

      if (!title || !content || !connectionId || !scheduledTime) {
        return res.status(400).json({ 
          success: false, 
          error: 'Title, content, connection ID, and scheduled time are required' 
        });
      }

      // Validate scheduled time is in the future
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Scheduled time must be in the future' 
        });
      }

      // Get connection information
      const connection = await storage.getSocialConnection(connectionId);
      if (!connection || connection.userId !== userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid connection ID' 
        });
      }

      const scheduledPost = await storage.createScheduledPost({
        userId,
        articleId: articleId || null,
        title,
        content,
        platforms: [{
          platform: connection.platform,
          connectionId: connectionId,
          accountName: connection.accountName
        }],
        scheduledTime: scheduledDate,
        status: 'pending'
      });

      res.json({ success: true, data: scheduledPost });
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      res.status(500).json({ success: false, error: 'Failed to create scheduled post' });
    }
  });

  // Update scheduled post
  app.patch('/api/scheduled-posts/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const postId = parseInt(req.params.id);
      const userId = req.user.id;
      const { title, content, excerpt, featuredImage, platforms, scheduledTime } = req.body;

      // Verify post belongs to user
      const post = await storage.getScheduledPost(postId);
      if (!post || post.userId !== userId) {
        return res.status(404).json({ success: false, error: 'Scheduled post not found' });
      }

      // Don't allow editing posts that are processing or completed
      if (['processing', 'completed'].includes(post.status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot edit posts that are processing or completed' 
        });
      }

      const updatedPost = await storage.updateScheduledPost(postId, {
        title,
        content,
        excerpt,
        featuredImage,
        platforms,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined
      });

      res.json({ success: true, data: updatedPost });
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      res.status(500).json({ success: false, error: 'Failed to update scheduled post' });
    }
  });

  // Cancel scheduled post
  app.patch('/api/scheduled-posts/:id/cancel', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const postId = parseInt(req.params.id);
      const userId = req.user.id;

      // Verify post belongs to user
      const post = await storage.getScheduledPost(postId);
      if (!post || post.userId !== userId) {
        return res.status(404).json({ success: false, error: 'Scheduled post not found' });
      }

      // Only allow cancelling pending posts
      if (post.status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          error: 'Can only cancel pending posts' 
        });
      }

      const cancelledPost = await storage.updateScheduledPost(postId, {
        status: 'cancelled'
      });

      res.json({ success: true, data: cancelledPost });
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel scheduled post' });
    }
  });

  // Delete scheduled post
  app.delete('/api/scheduled-posts/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const postId = parseInt(req.params.id);
      const userId = req.user.id;

      // Verify post belongs to user
      const post = await storage.getScheduledPost(postId);
      if (!post || post.userId !== userId) {
        return res.status(404).json({ success: false, error: 'Scheduled post not found' });
      }

      await storage.deleteScheduledPost(postId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      res.status(500).json({ success: false, error: 'Failed to delete scheduled post' });
    }
  });

  // Get publishing logs for a scheduled post
  app.get('/api/scheduled-posts/:id/logs', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const postId = parseInt(req.params.id);
      const logs = await storage.getPublishingLogs(postId);
      
      res.json({ success: true, data: logs });
    } catch (error) {
      console.error('Error fetching publishing logs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch logs' });
    }
  });

  // Publish post immediately
  app.post('/api/scheduled-posts/:id/publish-now', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const postId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the scheduled post
      const post = await storage.getScheduledPost(postId);
      
      if (!post || post.userId !== userId) {
        return res.status(404).json({ success: false, error: 'Bài đăng không tìm thấy' });
      }

      // Import scheduler and publish immediately
      const { PostScheduler } = await import('./scheduler');
      const scheduler = new PostScheduler();
      
      // Process the post immediately
      await scheduler.processPost(post);
      
      // Return result
      res.json({ 
        success: true, 
        message: 'Đã thử đăng bài ngay lập tức. Kiểm tra logs để xem kết quả.' 
      });
      
    } catch (error) {
      console.error('Error publishing post immediately:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Lỗi khi đăng bài ngay lập tức: ' + error.message 
      });
    }
  });

  // Get post templates
  app.get('/api/post-templates', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const platform = req.query.platform as string;

      const templates = await storage.getPostTemplates(userId, platform);
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('Error fetching post templates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch post templates' });
    }
  });

  // Create post template
  app.post('/api/post-templates', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { name, description, platform, template, isDefault } = req.body;

      if (!name || !platform || !template) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name, platform, and template are required' 
        });
      }

      const postTemplate = await storage.createPostTemplate({
        userId,
        name,
        description,
        platform,
        template,
        isDefault: isDefault || false
      });

      res.json({ success: true, data: postTemplate });
    } catch (error) {
      console.error('Error creating post template:', error);
      res.status(500).json({ success: false, error: 'Failed to create post template' });
    }
  });

  return httpServer;
}
