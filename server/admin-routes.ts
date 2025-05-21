import { Request, Response, Express } from "express";
import { storage } from "./storage";
import { db } from "@db";
import { z } from "zod";
import { format, subHours, subDays } from "date-fns";

/**
 * Registers admin routes for admin panel functionality
 */
export function registerAdminRoutes(app: Express) {
  // API lấy tất cả cài đặt hệ thống
  app.get("/api/admin/settings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      // Lấy tất cả các cài đặt
      const settings = await storage.getAllSettings();
      
      // Lấy cài đặt webhook SEO từ database - sử dụng một trường duy nhất
      const webhookSeoUrl = await storage.getSetting('content_webhook_seo');
      
      console.log('Fetched SEO webhook setting:', webhookSeoUrl);

      // Hiển thị dữ liệu webhook URL đã lưu để debug
      console.log('Settings to return:', {
        settings,
        seoWebhook: webhookSeoUrl
      });
      
      // Đảm bảo trả về dữ liệu với cấu trúc đơn giản và rõ ràng
      return res.status(200).json({
        success: true,
        data: {
          ...settings,
          // Chỉ thêm một trường duy nhất cho webhook SEO
          content_webhook_seo: webhookSeoUrl || '',
          // Duy trì tương thích ngược với code cũ - map sang các trường cũ
          webhookUrl: webhookSeoUrl || '',
          content_webhook_url: webhookSeoUrl || ''
        }
      });
    } catch (error) {
      console.error("Error getting settings:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // API cập nhật cài đặt webhook - phiên bản đơn giản hóa
  app.patch("/api/admin/settings/webhook", async (req: Request, res: Response) => {
    try {
      // Kiểm tra xác thực và phân quyền
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ 
          success: false, 
          error: "Unauthorized. Login required." 
        });
      }
      
      if (req.user.role !== "admin") {
        return res.status(403).json({ 
          success: false, 
          error: "Forbidden. Admin privileges required." 
        });
      }

      console.log("=== WEBHOOK SETTINGS UPDATE REQUEST ===");
      console.log("Request body:", JSON.stringify(req.body));
      
      // Lấy URL webhook từ các trường có thể
      const { webhookUrl, content_webhook_seo, webhookSecret } = req.body;
      const webhookValue = content_webhook_seo || webhookUrl || "";
      
      if (!webhookValue) {
        return res.status(400).json({
          success: false,
          error: "Webhook URL không được để trống"
        });
      }
      
      console.log("Webhook URL để cập nhật:", webhookValue);
      
      try {
        // Sử dụng pool query trực tiếp để cập nhật
        const { pool } = await import('@db');
        
        // Lấy cài đặt hiện tại để kiểm tra xem có tồn tại không
        const checkResult = await pool.query(
          "SELECT * FROM system_settings WHERE key = $1",
          ["content_webhook_seo"]
        );
        
        let updateResult;
        
        if (checkResult.rows.length > 0) {
          // Cập nhật bản ghi hiện có
          console.log("Tìm thấy cài đặt hiện có, đang cập nhật...");
          updateResult = await pool.query(
            "UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *",
            [webhookValue, "content_webhook_seo"]
          );
        } else {
          // Tạo bản ghi mới
          console.log("Không tìm thấy cài đặt, đang tạo mới...");
          updateResult = await pool.query(
            "INSERT INTO system_settings (key, value, category, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
            ["content_webhook_seo", webhookValue, "webhook"]
          );
        }
        
        console.log("Kết quả cập nhật/tạo mới:", updateResult.rows[0]);
        
        // Lưu webhook secret nếu có
        if (webhookSecret) {
          const secretCheck = await pool.query(
            "SELECT * FROM system_settings WHERE key = $1",
            ["webhook_secret"]
          );
          
          if (secretCheck.rows.length > 0) {
            await pool.query(
              "UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2",
              [webhookSecret, "webhook_secret"]
            );
          } else {
            await pool.query(
              "INSERT INTO system_settings (key, value, category, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
              ["webhook_secret", webhookSecret, "webhook"]
            );
          }
        }
        
        // Xác minh lại giá trị đã lưu
        const verification = await pool.query(
          "SELECT value FROM system_settings WHERE key = $1",
          ["content_webhook_seo"]
        );
        
        const savedValue = verification.rows.length > 0 ? verification.rows[0].value : null;
        console.log("Giá trị đã lưu trong database:", savedValue);
        
        return res.status(200).json({
          success: true,
          message: "Cài đặt webhook đã được cập nhật thành công",
          data: {
            webhookUrl: savedValue,
            content_webhook_seo: savedValue
          }
        });
      } catch (dbError) {
        console.error("Lỗi database khi cập nhật webhook:", dbError);
        return res.status(500).json({
          success: false,
          error: "Lỗi cơ sở dữ liệu: " + String(dbError)
        });
      }
    } catch (error) {
      console.error("Lỗi trong API cập nhật webhook:", error);
      return res.status(500).json({
        success: false,
        error: "Không thể cập nhật cài đặt webhook",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  // Lấy cấu hình gói dùng thử
  app.get("/api/admin/trial-plan", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const trialPlanIdSetting = await storage.getSetting('trial_plan_id');
      if (!trialPlanIdSetting) {
        return res.status(404).json({
          success: false,
          error: "Trial plan configuration not found"
        });
      }

      const trialPlanId = parseInt(trialPlanIdSetting);
      const trialPlan = await storage.getPlan(trialPlanId);

      if (!trialPlan) {
        return res.status(404).json({
          success: false,
          error: "Trial plan not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: trialPlan
      });
    } catch (error) {
      console.error("Error getting trial plan:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Cập nhật cấu hình gói dùng thử
  app.patch("/api/admin/trial-plan", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const { planId } = req.body;
      
      if (!planId || isNaN(parseInt(planId))) {
        return res.status(400).json({
          success: false,
          error: "Invalid plan ID"
        });
      }

      const plan = await storage.getPlan(parseInt(planId));
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: "Plan not found"
        });
      }

      // Cập nhật cấu hình
      await storage.setSetting('trial_plan_id', planId.toString(), 'plans');

      return res.status(200).json({
        success: true,
        data: {
          message: "Trial plan configuration updated successfully",
          plan
        }
      });
    } catch (error) {
      console.error("Error updating trial plan configuration:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  // Credit adjustment
  app.post("/api/admin/users/:id/credits", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const userId = parseInt(req.params.id);
      const { amount, description } = req.body;
      
      // Validate input
      if (typeof amount !== "number" || amount === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid amount. Must be a non-zero number." 
        });
      }

      // Add or subtract credits
      let newBalance;
      if (amount > 0) {
        newBalance = await storage.addUserCredits(userId, amount, undefined, description || "Admin adjustment");
      } else {
        newBalance = await storage.subtractUserCredits(userId, Math.abs(amount), description || "Admin adjustment");
      }

      return res.status(200).json({ 
        success: true, 
        data: { 
          userId, 
          adjustmentAmount: amount,
          currentCredits: newBalance
        } 
      });
    } catch (error) {
      console.error("Error adjusting user credits:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to adjust user credits" 
      });
    }
  });

  // Plan assignment
  app.post("/api/admin/users/:id/plans", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const userId = parseInt(req.params.id);
      const { planId, duration } = req.body;
      
      // Validate input
      if (!planId || typeof planId !== "number") {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid plan ID. Must provide a valid plan ID." 
        });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: "User not found" 
        });
      }

      // Check if plan exists
      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          error: "Plan not found" 
        });
      }

      // Create user plan
      const userPlan = await storage.createUserPlan({
        userId,
        planId,
        startDate: new Date(),
        endDate: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : undefined,
        isActive: true
      });

      // If it's a credit plan, add credits
      if (plan.type === "credit") {
        await storage.addUserCredits(userId, plan.value, planId, `Credits from plan: ${plan.name}`);
      }

      return res.status(200).json({ 
        success: true, 
        data: { 
          userPlan
        } 
      });
    } catch (error) {
      console.error("Error assigning plan to user:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to assign plan to user" 
      });
    }
  });

  // Get all plans (for admin only)
  app.get("/api/admin/plans", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const plans = await storage.getPlans();
      return res.status(200).json({ 
        success: true, 
        data: plans 
      });
    } catch (error) {
      console.error("Error getting plans:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to get plans" 
      });
    }
  });
  
  // Create a new plan
  app.post("/api/admin/plans", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const { name, description, type, price, value, duration } = req.body;
      
      // Basic validation
      if (!name || !type || price === undefined || value === undefined) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields. Name, type, price and value are required."
        });
      }
      
      // Create plan
      const plan = await storage.createPlan({
        name,
        description,
        type,
        price,
        value,
        duration
      });
      
      return res.status(201).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error("Error creating plan:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create plan"
      });
    }
  });
  
  // Update an existing plan
  app.patch("/api/admin/plans/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const planId = parseInt(req.params.id);
      const { name, description, type, price, value, duration } = req.body;
      
      // Check if plan exists
      const existingPlan = await storage.getPlan(planId);
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          error: "Plan not found"
        });
      }
      
      // Update plan
      const updatedPlan = await storage.updatePlan(planId, {
        name,
        description,
        type,
        price,
        value,
        duration
      });
      
      return res.status(200).json({
        success: true,
        data: updatedPlan
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update plan"
      });
    }
  });
  
  // Delete a plan
  app.delete("/api/admin/plans/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const planId = parseInt(req.params.id);
      
      // Check if plan exists
      const existingPlan = await storage.getPlan(planId);
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          error: "Plan not found"
        });
      }
      
      // Check if this is the trial plan
      const trialPlanIdSetting = await storage.getSetting('trial_plan_id');
      if (trialPlanIdSetting && parseInt(trialPlanIdSetting) === planId) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete the plan that is currently set as the trial plan. Please change the trial plan first."
        });
      }
      
      // Delete plan
      await storage.deletePlan(planId);
      
      return res.status(200).json({
        success: true,
        data: {
          message: "Plan deleted successfully"
        }
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete plan"
      });
    }
  });

  // Get performance metrics for admin dashboard
  app.get("/api/admin/performance", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized. Only admin users can perform this action." 
      });
    }

    try {
      const timeRange = req.query.timeRange as string || "24h";
      
      // Create a simple response with static data
      const performanceData = {
        averageResponseTime: 145,
        p95ResponseTime: 210,
        p99ResponseTime: 350,
        totalRequests: 12500,
        requestsPerMinute: 35,
        errorRate: 1.2,
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        
        responseTimeHistory: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          average: 100 + Math.floor(Math.random() * 100),
          p95: 150 + Math.floor(Math.random() * 100),
          p99: 200 + Math.floor(Math.random() * 150)
        })),
        
        requestsHistory: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          total: 400 + Math.floor(Math.random() * 200),
          errors: 2 + Math.floor(Math.random() * 8)
        })),
        
        resourceUsageHistory: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          cpu: 30 + Math.floor(Math.random() * 30),
          memory: 40 + Math.floor(Math.random() * 30),
          disk: 30 + Math.floor(Math.random() * 20)
        })),
        
        endpointPerformance: [
          {
            endpoint: "/api/content/generate",
            count: 324,
            averageTime: 180,
            errorRate: 0.5
          },
          {
            endpoint: "/api/auth",
            count: 1253,
            averageTime: 45,
            errorRate: 0.2
          },
          {
            endpoint: "/api/articles",
            count: 856,
            averageTime: 120,
            errorRate: 1.1
          },
          {
            endpoint: "/api/users",
            count: 231,
            averageTime: 90,
            errorRate: 0.4
          },
          {
            endpoint: "/api/webhooks",
            count: 176,
            averageTime: 320,
            errorRate: 4.2
          }
        ],
        
        timeRange: timeRange
      };

      return res.status(200).json({
        success: true,
        data: performanceData
      });
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to get performance metrics" 
      });
    }
  });
}