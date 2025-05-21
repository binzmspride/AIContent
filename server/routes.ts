import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { systemSettings } from "../shared/schema";
import { processWebhookInBackground } from "./webhook-handler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Thiết lập xác thực người dùng
  setupAuth(app);

  // HTTP server để đáp ứng request
  const httpServer = createServer(app);

  // API tạo nội dung - hỗ trợ tạo bài viết từ API hoặc thông qua webhook
  app.post("/api/generate-content", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }

      const user = req.user;
      
      // Kiểm tra tài khoản
      if (!user) {
        return res.status(403).json({ success: false, message: "User not found" });
      }

      const contentRequest = req.body;
      
      // Kiểm tra các trường bắt buộc
      if (!contentRequest.keywords) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      // Xác định số credits cần thiết dựa vào độ dài nội dung yêu cầu
      let creditsToDeduct = 1; // Mặc định là 1 credit cho mỗi bài viết ngắn
      
      if (contentRequest.length === 'medium') {
        creditsToDeduct = 2;
      } else if (contentRequest.length === 'long') {
        creditsToDeduct = 3;
      }
      
      // Kiểm tra số dư credits
      const userCredits = await storage.getUserCredits(user.id);
      
      if (userCredits < creditsToDeduct) {
        return res.status(402).json({ 
          success: false, 
          message: "Insufficient credits", 
          data: { 
            credits: userCredits,
            required: creditsToDeduct
          }
        });
      }
      
      // Trừ credits
      await storage.subtractUserCredits(
        user.id, 
        creditsToDeduct, 
        `Tạo nội dung "${contentRequest.keywords}"`
      );
      
      // Tạo bài viết mới với trạng thái nháp
      const newArticle = await storage.createArticle({
        userId: user.id,
        title: `Đang tạo bài viết về ${contentRequest.keywords}`,
        content: "<p>Đang tạo nội dung, vui lòng đợi trong giây lát...</p>",
        status: 'draft',
        creditsUsed: creditsToDeduct,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Lấy cài đặt webhook SEO URL từ database - chỉ sử dụng một trường duy nhất
      const webhookSeoUrl = await storage.getSetting('content_webhook_seo');
      
      // In ra log để debug
      console.log("====== WEBHOOK DEBUG INFO ======");
      console.log("Webhook SEO URL trong database:", webhookSeoUrl);
      
      // Sử dụng URL webhook SEO
      let finalWebhookUrl = webhookSeoUrl;
      
      if (!finalWebhookUrl) {
        console.warn("Không tìm thấy URL webhook, sẽ tạo nội dung mẫu");
        
        // Cập nhật bài viết với lỗi cấu hình webhook
        await storage.updateArticle(newArticle.id, {
          title: "Lỗi cấu hình webhook",
          content: "<p>Hệ thống chưa được cấu hình URL webhook. Vui lòng cấu hình trong phần Cài đặt.</p>",
          updatedAt: new Date()
        });
        
        // Trả về phản hồi cho người dùng
        return res.json({
          success: true,
          message: "Đã bắt đầu tạo nội dung",
          data: {
            articleId: newArticle.id,
            title: "Lỗi cấu hình webhook",
            content: "<p>Hệ thống chưa được cấu hình URL webhook. Vui lòng cấu hình trong phần Cài đặt.</p>",
            keywords: contentRequest.keywords.split(',').map((k: string) => k.trim()),
            creditsUsed: creditsToDeduct
          }
        });
      }
      
      console.log("Webhook URL được sử dụng:", finalWebhookUrl);

      // Tạo phản hồi ngay lập tức
      const mockResponse = {
        articleId: newArticle.id,
        title: `Bài viết về ${contentRequest.keywords}`,
        content: "<p>Nội dung đang được tạo...</p>",
        keywords: contentRequest.keywords.split(',').map((k: string) => k.trim()),
        creditsUsed: creditsToDeduct,
        metrics: {
          wordCount: 0,
          readingTime: 0,
          sentiment: 'neutral',
          seoScore: 0
        }
      };

      // Phản hồi ngay cho người dùng với ID bài viết và thông tin credits đã trừ
      res.json({
        success: true,
        message: "Đã bắt đầu tạo nội dung",
        data: mockResponse
      });

      // Gửi request đến webhook trong nền (không chờ đợi)
      try {
        // Tạo dữ liệu yêu cầu cho webhook
        const extendedRequest = {
          ...contentRequest,
          articleId: newArticle.id,
          userId: user.id,
          username: user.username,
          timestamp: new Date().toISOString()
        };

        // Chuẩn bị headers
        const headers = {
          'Content-Type': 'application/json',
          'X-Callback-URL': `${req.protocol}://${req.get('host')}/api/webhook/callback`
        };
        
        // Log để debug
        console.log('Đang gửi request đến webhook URL:', finalWebhookUrl);
        
        // Gọi hàm xử lý webhook không đồng bộ (không đợi kết quả)
        processWebhookInBackground(
          finalWebhookUrl,
          extendedRequest,
          headers,
          newArticle.id,
          user.id
        ).catch(error => {
          console.error('Lỗi xử lý webhook:', error);
        });
      } catch (error) {
        console.error('Lỗi khi xử lý webhook:', error);
        await storage.updateArticle(newArticle.id, {
          title: "Lỗi kết nối",
          content: "<p>Không thể kết nối đến dịch vụ tạo nội dung</p>"
        });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Lỗi khi tạo nội dung", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Endpoint nhận kết quả từ dịch vụ tạo nội dung (gọi qua webhook)
  app.post("/api/webhook/callback", async (req: Request, res: Response) => {
    try {
      console.log("Webhook callback received");
      
      const { articleId, content, aiTitle } = req.body;

      if (!articleId) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields: articleId" 
        });
      }

      // Kiểm tra xem bài viết có tồn tại không
      const article = await storage.getArticleById(parseInt(articleId));
      
      if (!article) {
        return res.status(404).json({ 
          success: false, 
          message: `Article with ID ${articleId} not found` 
        });
      }

      // Cập nhật bài viết với nội dung từ webhook
      const updatedArticle = await storage.updateArticle(parseInt(articleId), {
        title: aiTitle || article.title,
        content: content || article.content,
        updatedAt: new Date()
      });

      return res.json({ 
        success: true, 
        message: "Article updated successfully", 
        data: { articleId }
      });
    } catch (error) {
      console.error("Error processing webhook callback:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error processing webhook callback",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Lấy danh sách bài viết
  app.get("/api/articles", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }

      const user = req.user;
      
      if (!user) {
        return res.status(403).json({ success: false, message: "User not found" });
      }

      // Phân trang
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      // Lấy danh sách bài viết
      const result = await storage.getArticlesByUser(user.id, page, limit, status);

      return res.json({
        success: true,
        data: result.articles,
        pagination: {
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error("Error retrieving articles:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error retrieving articles",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Lấy chi tiết bài viết
  app.get("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }

      const user = req.user;
      
      if (!user) {
        return res.status(403).json({ success: false, message: "User not found" });
      }

      const articleId = parseInt(req.params.id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, message: "Invalid article ID" });
      }

      // Lấy chi tiết bài viết
      const article = await storage.getArticleById(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, message: "Article not found" });
      }

      // Kiểm tra quyền truy cập
      if (article.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      return res.json({ success: true, data: article });
    } catch (error) {
      console.error("Error retrieving article:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error retrieving article",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  return httpServer;
}