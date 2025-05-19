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
import { registerAdminRoutes } from "./admin-routes";
import { getFirebaseConfig, verifyFirebaseToken, findUserByFirebaseAuth, createUserFromFirebase } from "./firebase-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Register API routes for third-party integration
  registerApiRoutes(app);
  
  // Register admin routes
  registerAdminRoutes(app);

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
      const status = req.query.status as string | undefined;
      
      const { articles, total } = await storage.getArticlesByUser(userId, page, limit, status);
      
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
  
  // Lấy thông tin chi tiết bài viết (cho xem)
  app.get('/api/articles/:id', async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, error: 'ID bài viết không hợp lệ' });
      }
      
      const article = await storage.getArticle(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
      }
      
      // Kiểm tra quyền - chỉ người viết và admin mới có thể xem
      if (req.isAuthenticated()) {
        // Người dùng đã đăng nhập
        if (req.user.id !== article.userId && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, error: 'Bạn không có quyền xem bài viết này' });
        }
      } else if (article.status !== 'published') {
        // Nếu không đăng nhập, chỉ xem được bài viết đã xuất bản
        return res.status(403).json({ success: false, error: 'Bài viết này chưa được xuất bản' });
      }
      
      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ success: false, error: 'Lỗi khi lấy thông tin bài viết' });
    }
  });
  
  // Lấy thông tin chi tiết bài viết (cho chỉnh sửa)
  app.get('/api/dashboard/articles/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập' });
      }
      
      const articleId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, error: 'ID bài viết không hợp lệ' });
      }
      
      const article = await storage.getArticle(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
      }
      
      // Kiểm tra quyền - chỉ người viết và admin mới có thể chỉnh sửa
      if (article.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Bạn không có quyền chỉnh sửa bài viết này' });
      }
      
      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error fetching article for edit:', error);
      res.status(500).json({ success: false, error: 'Lỗi khi lấy thông tin bài viết' });
    }
  });
  
  // Cập nhật bài viết
  app.patch('/api/dashboard/articles/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập' });
      }
      
      const articleId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, error: 'ID bài viết không hợp lệ' });
      }
      
      const article = await storage.getArticle(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
      }
      
      // Kiểm tra quyền - chỉ người viết và admin mới có thể chỉnh sửa
      if (article.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Bạn không có quyền chỉnh sửa bài viết này' });
      }
      
      // Cập nhật dữ liệu bài viết
      const { title, content, keywords, status } = req.body;
      const updatedArticle = await storage.updateArticle(articleId, {
        title,
        content,
        keywords,
        status,
        updatedAt: new Date()
      });
      
      res.json({ success: true, data: updatedArticle });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ success: false, error: 'Lỗi khi cập nhật bài viết' });
    }
  });

  // Create or update article
  app.post('/api/dashboard/articles', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const { id, title, content, keywords, creditsUsed = 1 } = req.body;
      
      // Nếu có id, kiểm tra xem bài viết đã tồn tại chưa
      if (id) {
        // Kiểm tra bài viết có thuộc về người dùng này không
        const existingArticle = await storage.getArticle(id);
        if (existingArticle && existingArticle.userId === userId) {
          // Cập nhật bài viết
          const updatedArticle = await storage.updateArticle(id, {
            title,
            content,
            keywords,
            updatedAt: new Date()
          });
          
          return res.status(200).json({ success: true, data: updatedArticle });
        }
      }
      
      // Tạo bài viết mới nếu không có id hoặc bài viết không tồn tại
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
      console.error('Error creating/updating article:', error);
      res.status(500).json({ success: false, error: 'Failed to create/update article' });
    }
  });

  // Generate content with n8n webhook
  app.post('/api/dashboard/generate-content', async (req, res) => {
    console.log('=== GENERATE CONTENT API CALLED ===');
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const contentRequest = req.body as GenerateContentRequest;
      
      // Đảm bảo từ khóa được trim để tránh vấn đề với dấu cách ở đầu/cuối
      contentRequest.keywords = contentRequest.keywords.trim();
      
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
      
      // Đợi nếu đang chạy trong chế độ dev để không tiêu hao credits thực
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      // Lấy URL webhook từ cơ sở dữ liệu
      const webhookUrl = await storage.getSetting('notificationWebhookUrl');
      const webhookSecret = await storage.getSetting('webhookSecret');
      
      console.log('Webhook URL from database:', webhookUrl);
      console.log('Webhook Secret from database:', webhookSecret ? '(exists)' : '(not set)');
      
      if (!webhookUrl) {
        return res.status(500).json({
          success: false,
          error: 'Webhook URL not configured. Please contact administrator.'
        });
      }
      
      try {
        // Chuẩn bị payload để gửi đến webhook
        const webhookPayload = {
          ...contentRequest,
          userId: userId,
          username: req.user.username,
          timestamp: new Date().toISOString(),
          // Không gửi webhook secret vì bạn không sử dụng nó
        };
        
        // Đảm bảo các trường từ khóa chính và từ khóa phụ được gửi đi
        if (!webhookPayload.mainKeyword && webhookPayload.keywords) {
          // Nếu không có mainKeyword nhưng có keywords, tách từ keywords
          const keywordsArray = webhookPayload.keywords.split(',').filter(Boolean);
          webhookPayload.mainKeyword = keywordsArray.length > 0 ? keywordsArray[0].trim() : '';
          webhookPayload.secondaryKeywords = keywordsArray.length > 1 
            ? keywordsArray.slice(1).map(k => k.trim()).join(',') 
            : '';
        }
        
        console.log(`Sending content request to webhook: ${webhookUrl}`);
        console.log('Webhook payload:', JSON.stringify(webhookPayload, null, 2));
        
        // Kiểm tra webhook URL có thể truy cập được không trước khi gửi request
        // Nếu webhookUrl không hoạt động, trả về dữ liệu ví dụ để phát triển
        let webhookResponse;
        try {
          webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          });
        } catch (fetchError) {
          console.error('Error connecting to webhook:', fetchError);
          
          // Trong môi trường phát triển, trả về dữ liệu mẫu nếu webhook không hoạt động
          if (isDevelopment) {
            console.log('Development mode: returning mock data due to webhook error');
            
            // Giả lập phản hồi webhook thành công
            const mockResponse = {
              title: contentRequest.title || `Bài viết về ${contentRequest.keywords}`,
              content: `<h1>Nội dung mẫu về ${contentRequest.keywords}</h1><p>Đây là nội dung mẫu được tạo ra khi webhook không hoạt động. Trong môi trường thực, nội dung này sẽ được tạo ra bởi AI dựa trên các thông số bạn đã cấu hình.</p><h2>Các từ khóa</h2><p>${contentRequest.keywords}</p>`,
              keywords: contentRequest.keywords.split(','),
              creditsUsed: creditsNeeded,
              metrics: {
                generationTimeMs: 1500,
                wordCount: 150
              }
            };
            
            // Trừ credits
            await storage.subtractUserCredits(userId, creditsNeeded, 'Content generation');
            
            return res.json({
              success: true,
              data: mockResponse
            });
          } else {
            throw new Error('Cannot connect to webhook service');
          }
        }
        
        console.log(`Webhook response status: ${webhookResponse.status}`);
        
        if (!webhookResponse.ok) {
          // Trong trường hợp webhook không hoạt động (lỗi 404 hoặc lỗi khác), thông báo lỗi
          console.log(`Webhook error with status ${webhookResponse.status}.`);
          
          // Trả về lỗi cho người dùng biết có vấn đề với dịch vụ tạo nội dung
          return res.status(webhookResponse.status).json({
            success: false,
            error: `Không thể kết nối với dịch vụ tạo nội dung. Mã lỗi: ${webhookResponse.status}. Vui lòng kiểm tra cấu hình webhook hoặc thử lại sau.`
          });
        }
        
        // Xử lý phản hồi từ webhook
        const responseText = await webhookResponse.text();
        console.log('Webhook response text:', responseText);
        
        let webhookResult;
        try {
          webhookResult = JSON.parse(responseText);
          console.log('Parsed webhook result:', webhookResult);
        } catch (parseError) {
          console.error('Failed to parse webhook response as JSON:', parseError);
          
          // Sử dụng dữ liệu mẫu trong môi trường phát triển khi webhook lỗi
          if (process.env.NODE_ENV !== 'production') {
            console.log('Cung cấp dữ liệu mẫu do webhook lỗi JSON');
            
            const demoTitle = `Hướng dẫn chăm sóc ${contentRequest.mainKeyword || contentRequest.keywords.split(',')[0] || 'cây cảnh'}`;
            
            const demoContent = `<h2>Giới thiệu</h2>
<p>Chăm sóc cây cảnh đúng cách không chỉ giúp cây phát triển khỏe mạnh mà còn làm đẹp không gian sống của bạn. Bài viết này sẽ chia sẻ những kiến thức cơ bản về cách chăm sóc cây cảnh hiệu quả.</p>

<h2>Hướng dẫn tưới nước</h2>
<p>Tưới nước là yếu tố quan trọng nhất trong việc chăm sóc cây cảnh. Mỗi loại cây có nhu cầu nước khác nhau:</p>
<ul>
<li>Cây xanh trong nhà: Tưới 1-2 lần/tuần</li>
<li>Cây sa mạc: Tưới 1 lần/2 tuần</li>
<li>Cây ưa ẩm: Tưới 2-3 lần/tuần</li>
</ul>

<h2>Bón phân đúng cách</h2>
<p>Phân bón cung cấp dinh dưỡng thiết yếu cho cây phát triển. Có nhiều loại phân bón khác nhau:</p>
<ul>
<li><strong>Phân hữu cơ</strong>: An toàn, thân thiện với môi trường</li>
<li><strong>Phân NPK</strong>: Cung cấp đầy đủ đạm, lân, kali</li>
<li><strong>Phân chuyên dụng</strong>: Phù hợp với từng loại cây</li>
</ul>

<h2>Cách xử lý sâu bệnh</h2>
<p>Phát hiện và xử lý sâu bệnh kịp thời sẽ giúp cây luôn khỏe mạnh. Một số cách xử lý phổ biến:</p>
<ol>
<li>Sử dụng xà phòng loãng phun lên lá</li>
<li>Dùng dung dịch vôi pha loãng</li>
<li>Áp dụng các chế phẩm sinh học</li>
</ol>

<h2>Kết luận</h2>
<p>Chăm sóc cây cảnh đúng cách không chỉ giúp cây phát triển tốt mà còn mang lại không gian sống xanh, sạch và tràn đầy năng lượng tích cực.</p>`;

            webhookResult = {
              success: true,
              data: [{
                aiTitle: demoTitle,
                articleContent: demoContent
              }]
            };
            console.log('Đã tạo dữ liệu mẫu cho webhook:', webhookResult);
          } else {
            throw new Error('Invalid JSON response from webhook');
          }
        }
        
        // Trong môi trường production hoặc test, trừ credits
        if (!isDevelopment) {
          await storage.subtractUserCredits(userId, creditsNeeded, `Content generation: ${contentRequest.title}`);
        } else {
          console.log(`DEV MODE: Would subtract ${creditsNeeded} credits for content generation`);
        }
        
        // Xử lý cấu trúc JSON từ webhook với articleContent và aiTitle
        let formattedResult;
        
        // Kiểm tra cấu trúc webhookResult
        if (webhookResult && Array.isArray(webhookResult.data) && webhookResult.data.length > 0) {
          // Nếu webhookResult có cấu trúc { success: true, data: [{ articleContent, aiTitle }] }
          const firstResult = webhookResult.data[0];
          
          if (firstResult.articleContent && firstResult.aiTitle) {
            // Chuyển đổi sang định dạng mà client đang mong đợi
            formattedResult = {
              title: firstResult.aiTitle.trim(),
              content: firstResult.articleContent,
              keywords: contentRequest.keywords.split(','),
              creditsUsed: creditsNeeded,
              metrics: {
                generationTimeMs: 5000, // Giá trị mặc định vì webhook không trả về thời gian
                wordCount: firstResult.articleContent.split(/\s+/).length // Ước tính số từ
              }
            };
            console.log("Đã xử lý dữ liệu từ webhook với định dạng mới (articleContent, aiTitle)");
          } else {
            // Dữ liệu không đúng định dạng, giữ nguyên kết quả
            formattedResult = webhookResult;
            console.log("Không tìm thấy articleContent hoặc aiTitle trong phản hồi webhook:", firstResult);
          }
        } else {
          // Giữ nguyên kết quả nếu không phải cấu trúc mới
          formattedResult = webhookResult;
          console.log("Phản hồi webhook không có cấu trúc mong đợi:", webhookResult);
        }
        
        return res.json({ 
          success: true, 
          data: formattedResult 
        });
      } catch (error) {
        const webhookError = error as Error;
        console.error('Webhook error:', webhookError);
        
        // Trong trường hợp lỗi webhook, tạo phản hồi lỗi chi tiết hơn để người dùng có thể hiểu
        return res.status(500).json({
          success: false,
          error: `Error calling n8n webhook: ${webhookError.message || 'Unknown error'}. Please check the webhook URL and try again.`
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
  // Get all system settings
  app.get('/api/admin/settings', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      // Lấy các cài đặt từ các category khác nhau
      const generalSettings = await storage.getSettingsByCategory('general');
      const aiSettings = await storage.getSettingsByCategory('ai');
      const emailSettings = await storage.getSettingsByCategory('email');
      const apiSettings = await storage.getSettingsByCategory('api');
      const webhookSettings = await storage.getSettingsByCategory('webhook');
      
      const smtpConfig = await storage.getSmtpSettings();
      const appBaseUrl = await storage.getSetting('appBaseUrl');
      
      // Kết hợp tất cả cài đặt vào một đối tượng
      const allSettings = {
        // General settings
        siteName: generalSettings.siteName || "SEO AI Writer",
        siteDescription: generalSettings.siteDescription || "AI-powered SEO content generation platform",
        contactEmail: generalSettings.contactEmail || "contact@example.com",
        supportEmail: generalSettings.supportEmail || "support@example.com",
        
        enableNewUsers: generalSettings.enableNewUsers === 'true',
        enableArticleCreation: generalSettings.enableArticleCreation === 'true',
        enableAutoPublish: generalSettings.enableAutoPublish === 'true',
        maintenanceMode: generalSettings.maintenanceMode === 'true',
        
        // AI settings
        aiModel: aiSettings.aiModel || "gpt-3.5-turbo",
        aiTemperature: parseFloat(aiSettings.aiTemperature || "0.7"),
        aiContextLength: parseInt(aiSettings.aiContextLength || "4000"),
        systemPromptPrefix: aiSettings.systemPromptPrefix || "",
        
        defaultUserCredits: parseInt(aiSettings.defaultUserCredits || "50"),
        creditCostPerArticle: parseInt(aiSettings.creditCostPerArticle || "10"),
        creditCostPerImage: parseInt(aiSettings.creditCostPerImage || "5"),
        
        // Email settings
        smtpServer: smtpConfig?.smtpServer || "",
        smtpPort: smtpConfig?.smtpPort || 587,
        smtpUsername: smtpConfig?.smtpUsername || "",
        smtpPassword: smtpConfig?.smtpPassword || "",
        emailSender: smtpConfig?.emailSender || "",
        appBaseUrl: appBaseUrl || "http://localhost:5000",
        
        // API integration settings
        openaiApiKey: apiSettings.openaiApiKey || "",
        claudeApiKey: apiSettings.claudeApiKey || "",
        wordpressApiUrl: apiSettings.wordpressApiUrl || "",
        wordpressApiUser: apiSettings.wordpressApiUser || "",
        wordpressApiKey: apiSettings.wordpressApiKey || "",
        
        // Webhook settings
        webhookSecret: webhookSettings.webhookSecret || "",
        notificationWebhookUrl: webhookSettings.notificationWebhookUrl || "",
        
        // System info
        version: "1.0.0",
        lastBackup: new Date().toISOString(),
        dbStatus: "online",
      };
      
      res.json({ 
        success: true, 
        data: allSettings 
      });
    } catch (error) {
      console.error('Error fetching system settings:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  // Get all users
  app.get('/api/admin/users', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '10');
      
      const { users, total } = await storage.listUsers(page, limit);
      
      // Remove passwords and get user plans
      const usersWithPlans = await Promise.all(users.map(async user => {
        const { password, ...userWithoutPassword } = user;
        
        // Get user's active plans
        const userPlans = await storage.getUserPlans(user.id);
        const activePlans = userPlans.filter(up => up.isActive);
        
        // Format plan info for display
        const planInfo = activePlans.length > 0 
          ? activePlans.map(up => up.plan.name).join(', ')
          : 'Không có gói';
        
        return {
          ...userWithoutPassword,
          planInfo
        };
      }));
      
      res.json({
        success: true,
        data: {
          users: usersWithPlans,
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
  
  // Firebase Config API - Get Firebase configuration
  app.get('/api/firebase/config', async (req, res) => {
    try {
      const config = await getFirebaseConfig();
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Firebase configuration not found'
        });
      }
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error getting Firebase config:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get Firebase config' 
      });
    }
  });
  
  // Firebase Auth API - Handle Firebase authentication
  app.post('/api/auth/firebase', async (req, res) => {
    try {
      const { idToken, email, displayName, photoURL } = req.body;
      
      if (!idToken || !email) {
        return res.status(400).json({
          success: false,
          error: 'Firebase ID token and email are required'
        });
      }
      
      // Xác thực token Firebase
      const firebaseUser = await verifyFirebaseToken(idToken, {
        email,
        displayName,
        photoURL
      });
      
      if (!firebaseUser) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Firebase token'
        });
      }
      
      // Tìm người dùng hiện có
      let user = await findUserByFirebaseAuth(email, firebaseUser.firebaseId);
      
      // Nếu người dùng không tồn tại, tạo người dùng mới
      if (!user) {
        user = await createUserFromFirebase(firebaseUser);
        
        if (!user) {
          return res.status(500).json({
            success: false,
            error: 'Failed to create user from Firebase auth'
          });
        }
      }
      
      // Đăng nhập người dùng
      req.login(user, (err) => {
        if (err) {
          console.error('Error logging in Firebase user:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to login'
          });
        }
        
        // Trả về thông tin người dùng (không bao gồm mật khẩu)
        const { password, ...userWithoutPassword } = user;
        
        res.json({
          success: true,
          data: userWithoutPassword
        });
      });
    } catch (error) {
      console.error('Error in Firebase authentication:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  });
  
  // Firebase settings API (update Firebase settings)
  app.patch('/api/admin/settings/firebase', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Admin access required' 
        });
      }

      const { 
        firebaseApiKey, 
        firebaseProjectId, 
        firebaseAppId, 
        enableGoogleAuth, 
        enableFacebookAuth 
      } = req.body;
      
      // Validate required fields
      if (!firebaseApiKey || !firebaseProjectId || !firebaseAppId) {
        return res.status(400).json({ 
          success: false, 
          error: 'All Firebase configuration fields are required' 
        });
      }
      
      // Save Firebase settings
      await storage.setSetting('firebaseApiKey', firebaseApiKey, 'firebase');
      await storage.setSetting('firebaseProjectId', firebaseProjectId, 'firebase');
      await storage.setSetting('firebaseAppId', firebaseAppId, 'firebase');
      await storage.setSetting('enableGoogleAuth', String(enableGoogleAuth), 'firebase');
      await storage.setSetting('enableFacebookAuth', String(enableFacebookAuth), 'firebase');
      
      res.json({
        success: true,
        message: 'Firebase settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating Firebase settings:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update Firebase settings' 
      });
    }
  });
  
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

  // Webhook settings API (update webhook settings)
  app.patch('/api/admin/settings/webhook', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Admin access required' 
        });
      }

      const { webhookSecret, notificationWebhookUrl } = req.body;
      
      // Validate webhookSecret if provided and not empty
      if (webhookSecret !== undefined) {
        if (webhookSecret.trim() !== '' && !webhookSecret.startsWith('whsec_')) {
          return res.status(400).json({ 
            success: false, 
            error: 'Webhook secret must start with whsec_' 
          });
        }
        
        // Save webhook settings (including empty string to clear it)
        await storage.setSetting('webhookSecret', webhookSecret, 'webhook');
      }
      
      // Xử lý cập nhật notificationWebhookUrl, cả khi có giá trị và khi rỗng
      if (notificationWebhookUrl !== undefined) {
        // Kiểm tra URL nếu không rỗng
        if (notificationWebhookUrl.trim() !== '') {
          try {
            new URL(notificationWebhookUrl);
          } catch (e) {
            return res.status(400).json({
              success: false,
              error: 'Invalid webhook URL format'
            });
          }
        }
        
        // Lưu URL webhook (kể cả khi là chuỗi rỗng để xóa webhook)
        await storage.setSetting('notificationWebhookUrl', notificationWebhookUrl, 'webhook');
      }
      
      res.json({ 
        success: true, 
        message: 'Webhook settings updated successfully' 
      });
    } catch (error) {
      console.error('Error updating webhook settings:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });
  
  // Admin API route for adjusting user credits
  app.post('/api/admin/users/:id/credits', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const userId = parseInt(req.params.id);
      const { amount, description } = req.body;
      
      if (typeof amount !== 'number' || isNaN(amount)) {
        return res.status(400).json({ success: false, error: 'Số lượng credits không hợp lệ' });
      }
      
      // Lấy thông tin người dùng hiện tại
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
      }
      
      // Thực hiện thêm hoặc trừ credits tùy thuộc vào giá trị amount
      let updatedCredits;
      if (amount >= 0) {
        // Nếu amount dương, thêm credits
        updatedCredits = await storage.addUserCredits(userId, amount, undefined, description || 'Credits điều chỉnh bởi quản trị viên');
      } else {
        // Nếu amount âm, trừ credits
        try {
          updatedCredits = await storage.subtractUserCredits(userId, Math.abs(amount), description || 'Credits điều chỉnh bởi quản trị viên');
        } catch (error) {
          return res.status(400).json({ success: false, error: 'Số dư credits không đủ' });
        }
      }
      
      res.json({
        success: true,
        data: {
          userId,
          currentCredits: updatedCredits,
          adjustment: amount
        }
      });
    } catch (error) {
      console.error('Error adjusting user credits:', error);
      res.status(500).json({ success: false, error: 'Không thể điều chỉnh credits' });
    }
  });
  
  // Admin API route for assigning a plan to a user
  app.post('/api/admin/users/:id/plans', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const userId = parseInt(req.params.id);
      const { planId, duration } = req.body;
      
      if (!planId || typeof planId !== 'number') {
        return res.status(400).json({ success: false, error: 'ID gói dịch vụ không hợp lệ' });
      }
      
      // Kiểm tra người dùng tồn tại
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
      }
      
      // Kiểm tra gói dịch vụ tồn tại
      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy gói dịch vụ' });
      }
      
      // Tính toán ngày bắt đầu và kết thúc
      const startDate = new Date();
      let endDate = null;
      
      if (plan.duration || duration) {
        endDate = new Date();
        // Ưu tiên sử dụng duration từ request, nếu không có thì sử dụng duration của plan
        const durationDays = duration || plan.duration;
        endDate.setDate(endDate.getDate() + durationDays);
      }
      
      // Tạo gói cho người dùng
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
      console.error('Error assigning plan to user:', error);
      res.status(500).json({ success: false, error: 'Không thể gán gói dịch vụ cho người dùng' });
    }
  });

  return httpServer;
}
