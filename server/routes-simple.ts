import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import * as schema from "../shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { systemSettings } from "../shared/schema";
import { processWebhookInBackground } from "./webhook-handler";

// API response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Thiết lập xác thực người dùng
  setupAuth(app);

  // HTTP server để đáp ứng request
  const httpServer = createServer(app);

  // API tạo nội dung thông qua webhook
  app.post("/api/generate-content", async (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    try {
      const user = req.user;
      
      // Kiểm tra tài khoản
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      // Kiểm tra credits của người dùng
      if (user.credits <= 0) {
        return res.status(403).json({ 
          success: false, 
          message: "Không đủ credits để tạo nội dung" 
        });
      }

      // Lấy request data từ body
      const contentRequest = req.body;
      
      // Validate các trường bắt buộc
      if (!contentRequest.keywords || !contentRequest.length || !contentRequest.contentType || !contentRequest.language) {
        return res.status(400).json({ 
          success: false, 
          message: "Thiếu thông tin cần thiết" 
        });
      }

      // Thiết lập số credits cần trừ dựa trên độ dài bài viết
      let creditsToDeduct = 1;
      
      switch (contentRequest.length) {
        case 'medium':
          creditsToDeduct = 2;
          break;
        case 'long':
          creditsToDeduct = 3;
          break;
        case 'extra_long':
          creditsToDeduct = 5;
          break;
      }
      
      // Kiểm tra lại xem người dùng có đủ credits không
      if (user.credits < creditsToDeduct) {
        return res.status(403).json({ 
          success: false, 
          message: `Bạn cần ${creditsToDeduct} credits để tạo nội dung này, nhưng chỉ có ${user.credits}` 
        });
      }

      // Trừ credits trước khi tạo nội dung
      await storage.deductUserCredits(user.id, creditsToDeduct);
      
      // Tạo bài viết mới với trạng thái "draft"
      const newArticle = await storage.createArticle({
        userId: user.id,
        title: `Đang tạo nội dung... (${new Date().toLocaleString('vi-VN')})`,
        content: "<p>Đang xử lý yêu cầu tạo nội dung, vui lòng đợi trong giây lát...</p>",
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Lấy cài đặt hệ thống để biết webhook URL
      const webhookSettings = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, 'content_webhook_url')
      });
      
      if (!webhookSettings || !webhookSettings.value) {
        await storage.updateArticle(newArticle.id, {
          title: "Lỗi cấu hình",
          content: "<p>Hệ thống chưa được cấu hình webhook URL cho dịch vụ tạo nội dung</p>"
        });
        
        return res.status(500).json({ 
          success: false, 
          message: "Hệ thống chưa được cấu hình webhook" 
        });
      }

      // Tạo request mở rộng để gửi tới webhook với thông tin bổ sung
      const extendedRequest = {
        ...contentRequest,
        articleId: newArticle.id,
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString()
      };

      // Thiết lập headers cho request đến webhook
      const headers = {
        'Content-Type': 'application/json',
        'X-Callback-URL': `${req.protocol}://${req.get('host')}/api/webhook/callback`
      };

      // Tạo phản hồi mockup ngay lập tức
      const mockResponse = {
        articleId: newArticle.id,
        title: `Bài viết về ${contentRequest.keywords}`,
        content: "<p>Nội dung đang được tạo...</p>",
        keywords: contentRequest.keywords.split(',').map(k => k.trim()),
        creditsUsed: creditsToDeduct,
        metrics: {
          wordCount: 0,
          readingTime: 0,
          sentiment: 'neutral',
          seoScore: 0
        }
      };

      // Xử lý webhook trong background mà không đợi phản hồi
      processWebhookInBackground(
        webhookSettings.value || 'https://example.com/webhook', // Sử dụng URL mặc định nếu không có
        extendedRequest,
        headers,
        newArticle.id,
        user.id
      );

      // Phản hồi ngay cho người dùng với ID bài viết và thông tin credits đã trừ
      return res.json({
        success: true,
        message: "Đã bắt đầu tạo nội dung",
        data: mockResponse
      });
    } catch (error) {
      console.error("Error generating content:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Lỗi khi tạo nội dung", 
        error: error.message 
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

      // Cập nhật bài viết với nội dung mới
      await storage.updateArticle(parseInt(articleId), {
        title: aiTitle || article.title,
        content: content || article.content,
        updatedAt: new Date()
      });

      return res.json({ 
        success: true, 
        message: "Content updated successfully",
        data: { articleId }
      });
    } catch (error) {
      console.error("Error processing webhook callback:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Error processing webhook callback" 
      });
    }
  });

  // Đăng ký các route khác ở đây nếu cần

  return httpServer;
}