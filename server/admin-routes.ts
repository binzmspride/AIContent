import { Request, Response, Express } from "express";
import { storage } from "./storage";
import { z } from "zod";

/**
 * Registers admin routes for admin panel functionality
 */
export function registerAdminRoutes(app: Express) {
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
        data: { plans } 
      });
    } catch (error) {
      console.error("Error getting plans:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to get plans" 
      });
    }
  });
}