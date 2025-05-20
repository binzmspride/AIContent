import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { systemSettings } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Thiết lập xác thực người dùng
  setupAuth(app);

  // HTTP server để đáp ứng request
  const httpServer = createServer(app);

  // API tạo nội dung
  app.post("/api/generate-content", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }

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
      await storage.subtractUserCredits(user.id, creditsToDeduct, `Sử dụng ${creditsToDeduct} credits để tạo nội dung`);
      
      // Tạo bài viết mới với trạng thái "draft"
      const newArticle = await storage.createArticle({
        userId: user.id,
        title: `Đang tạo nội dung... (${new Date().toLocaleString('vi-VN')})`,
        content: "<p>Đang xử lý yêu cầu tạo nội dung, vui lòng đợi trong giây lát...</p>",
        status: 'draft',
        creditsUsed: creditsToDeduct,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Lấy cài đặt webhook URL từ database
      const webhookUrl = await storage.getSetting('content_webhook_url');
      
      // Sử dụng URL mặc định nếu không có cài đặt
      const contentWebhookUrl = webhookUrl || "https://n8n.example.com/webhook/content-generation";
      console.log("Using webhook URL:", contentWebhookUrl);

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

      // Phản hồi ngay cho người dùng với ID bài viết và thông tin credits đã trừ
      res.json({
        success: true,
        message: "Đã bắt đầu tạo nội dung",
        data: mockResponse
      });

      // Gửi request đến webhook trong nền (không chờ đợi)
      try {
        const extendedRequest = {
          ...contentRequest,
          articleId: newArticle.id,
          userId: user.id,
          username: user.username,
          timestamp: new Date().toISOString()
        };

        const headers = {
          'Content-Type': 'application/json',
          'X-Callback-URL': `${req.protocol}://${req.get('host')}/api/webhook/callback`
        };

        // Gửi request đến webhook với timeout và retry
        const fetchWithTimeout = async (url: string, options: any, timeout = 30000) => {
          const controller = new AbortController();
          const { signal } = controller;
          
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        };
        
        // Thêm tính năng retry cho webhook
        const fetchWithRetry = async (url: string, options: any, retries = 2) => {
          try {
            return await fetchWithTimeout(url, options);
          } catch (error: any) {
            if (retries > 0) {
              console.log(`Retrying webhook request. Attempts left: ${retries}`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return fetchWithRetry(url, options, retries - 1);
            }
            throw error;
          }
        };
        
        fetchWithRetry(contentWebhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(extendedRequest)
        })
        .then(async (response) => {
          if (!response.ok) {
            console.error(`Webhook error status: ${response.status}`);
            await storage.updateArticle(newArticle.id, {
              title: "Lỗi tạo nội dung",
              content: `<p>Đã xảy ra lỗi khi tạo nội dung. Mã lỗi: ${response.status}</p>`
            });
            return;
          }

          try {
            const responseText = await response.text();
            console.log(`Webhook response preview (first 200 chars): ${responseText.substring(0, 200)}`);
            
            // Kiểm tra xem phản hồi có phải HTML không (bắt đầu với DOCTYPE, <html hoặc chứa các thẻ HTML phổ biến)
            const isHtml = responseText.trim().startsWith('<!DOCTYPE') || 
                        responseText.trim().startsWith('<html') ||
                        responseText.includes('</html>') ||
                        responseText.includes('</body>') ||
                        responseText.includes('</head>');
                        
            if (isHtml) {
              console.log('Webhook returned HTML instead of JSON, generating alternative content');
              
              // Log thêm thông tin để debug
              console.log('Full response from webhook URL:', contentWebhookUrl);
              console.log('Response status:', response.status);
              console.log('Response headers:', JSON.stringify(Array.from(response.headers.entries())));
              
              // Cập nhật bài viết với thông báo lỗi chi tiết hơn
              await storage.updateArticle(newArticle.id, {
                title: `Bài viết về ${contentRequest.keywords}`,
                content: `
                  <p>Hệ thống không thể tạo nội dung tự động do webhook trả về định dạng HTML thay vì JSON.</p>
                  <h2>Thông tin lỗi:</h2>
                  <ul>
                    <li><strong>Webhook URL:</strong> ${contentWebhookUrl}</li>
                    <li><strong>Mã trạng thái:</strong> ${response.status}</li>
                    <li><strong>Loại phản hồi:</strong> HTML (không hợp lệ)</li>
                  </ul>
                  <h2>Thông tin bài viết yêu cầu:</h2>
                  <ul>
                    <li><strong>Chủ đề:</strong> ${contentRequest.keywords}</li>
                    <li><strong>Độ dài:</strong> ${contentRequest.length}</li>
                    <li><strong>Loại nội dung:</strong> ${contentRequest.contentType}</li>
                  </ul>
                  <p>Vui lòng kiểm tra cấu hình webhook trong phần <strong>Quản trị > Cài đặt</strong> và đảm bảo webhook URL trả về JSON hợp lệ.</p>
                `,
                updatedAt: new Date()
              });
              
              console.log('Article updated with detailed error information due to HTML response, ID:', newArticle.id);
              return;
            }
            
            // Xử lý JSON thông thường
            try {
              const webhookData = JSON.parse(responseText);
              
              // Cập nhật bài viết với nội dung từ webhook
              await storage.updateArticle(newArticle.id, {
                title: webhookData[0]?.aiTitle || webhookData?.aiTitle || "Bài viết mới",
                content: webhookData[0]?.content || webhookData?.content || "<p>Không có nội dung</p>",
                updatedAt: new Date()
              });
              
              console.log('Article updated with content from webhook, ID:', newArticle.id);
            } catch (jsonError) {
              console.error('Failed to parse webhook response as JSON:', jsonError);
              
              // Lưu phần đầu của phản hồi để debug
              console.log('Webhook response preview:', responseText.substring(0, 200));
              
              await storage.updateArticle(newArticle.id, {
                title: "Lỗi định dạng dữ liệu",
                content: "<p>Không thể xử lý dữ liệu từ dịch vụ tạo nội dung. Phản hồi không phải là JSON hợp lệ.</p>"
              });
            }
          } catch (error) {
            console.error('Error processing webhook response:', error);
            await storage.updateArticle(newArticle.id, {
              title: "Lỗi xử lý phản hồi",
              content: "<p>Đã xảy ra lỗi khi xử lý phản hồi từ dịch vụ tạo nội dung</p>"
            });
          }
        })
        .catch(async (error) => {
          console.error('Error calling webhook:', error);
          await storage.updateArticle(newArticle.id, {
            title: "Lỗi kết nối",
            content: "<p>Không thể kết nối đến dịch vụ tạo nội dung</p>"
          });
        });
      } catch (error) {
        console.error('Error processing webhook in background:', error);
        await storage.updateArticle(newArticle.id, {
          title: "Lỗi xử lý",
          content: "<p>Đã xảy ra lỗi khi xử lý dữ liệu từ webhook</p>"
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
        message: "Error processing webhook callback",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API lấy danh sách bài viết của người dùng
  app.get("/api/articles", async (req: Request, res: Response) => {
    try {
      // Kiểm tra người dùng đã đăng nhập
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }
      
      const user = req.user;
      
      // Phân trang
      const page = parseInt(req.query.page as string || "1");
      const limit = parseInt(req.query.limit as string || "10");
      
      // Lấy danh sách bài viết
      const result = await storage.getArticlesByUser(user.id, page, limit);
      
      res.json({
        success: true,
        data: result.articles,
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch articles", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API lấy chi tiết bài viết
  app.get("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      // Kiểm tra người dùng đã đăng nhập
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }
      
      const user = req.user;
      const articleId = parseInt(req.params.id);
      
      if (isNaN(articleId)) {
        return res.status(400).json({ success: false, message: "Invalid article ID" });
      }
      
      // Lấy bài viết
      const article = await storage.getArticleById(articleId);
      
      if (!article) {
        return res.status(404).json({ success: false, message: "Article not found" });
      }
      
      // Kiểm tra quyền truy cập
      if (article.userId !== user.id) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
      
      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch article", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  return httpServer;
}