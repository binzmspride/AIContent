import { Request, Response, Express } from "express";
import { storage } from "./storage";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Đăng ký các route để kiểm tra trạng thái hệ thống
 */
export function registerStatusRoutes(app: Express) {
  // API kiểm tra trạng thái cơ sở dữ liệu
  app.get("/api/status/database", async (_req: Request, res: Response) => {
    try {
      // Thử kết nối đến cơ sở dữ liệu bằng cách thực hiện truy vấn đơn giản
      await db.execute(sql`SELECT 1`);
      
      return res.status(200).json({
        success: true,
        online: true,
        message: "Database is online"
      });
    } catch (error) {
      console.error("Database connectivity error:", error);
      
      return res.status(200).json({
        success: false,
        online: false,
        message: "Database is offline or inaccessible",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API kiểm tra trạng thái webhook
  app.get("/api/status/webhook", async (_req: Request, res: Response) => {
    try {
      // Lấy URL webhook từ cơ sở dữ liệu
      const webhookUrl = await storage.getSetting('content_webhook_url');
      
      // Nếu không có URL webhook, trả về trạng thái chưa cấu hình
      if (!webhookUrl) {
        return res.status(200).json({
          success: false,
          configured: false,
          message: "Webhook URL not configured"
        });
      }

      // Trả về trạng thái đã cấu hình (không thực sự kiểm tra kết nối)
      return res.status(200).json({
        success: true,
        configured: true,
        url: webhookUrl,
        message: "Webhook is configured"
      });
    } catch (error) {
      console.error("Error checking webhook status:", error);
      
      return res.status(500).json({
        success: false,
        error: "Error checking webhook status",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}