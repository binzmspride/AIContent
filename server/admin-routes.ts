import { Request, Response, Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { format, subHours, subDays } from "date-fns";

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
      
      // Generate sample performance data
      // This would normally come from a monitoring service or database
      const now = new Date();
      
      // Determine date range based on timeRange parameter
      let startDate;
      switch (timeRange) {
        case "6h": startDate = subHours(now, 6); break;
        case "12h": startDate = subHours(now, 12); break;
        case "7d": startDate = subDays(now, 7); break;
        case "30d": startDate = subDays(now, 30); break;
        case "24h":
        default: startDate = subHours(now, 24); break;
      }

      // Generate sample performance data
      const responseTimeHistory = generateTimeSeriesData(startDate, now, (date) => ({
        timestamp: date.toISOString(),
        average: Math.floor(Math.random() * 50) + 70,
        p95: Math.floor(Math.random() * 50) + 120,
        p99: Math.floor(Math.random() * 50) + 170
      }));

      const requestsHistory = generateTimeSeriesData(startDate, now, (date) => ({
        timestamp: date.toISOString(),
        total: Math.floor(Math.random() * 100) + 400,
        errors: Math.floor(Math.random() * 10) + 1
      }));

      const resourceUsageHistory = generateTimeSeriesData(startDate, now, (date) => ({
        timestamp: date.toISOString(),
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        disk: Math.floor(Math.random() * 20) + 30
      }));

      // Calculate current metrics based on the latest data
      const latestResponseTime = responseTimeHistory[responseTimeHistory.length - 1];
      const latestRequests = requestsHistory[requestsHistory.length - 1];
      const latestResources = resourceUsageHistory[resourceUsageHistory.length - 1];

      const performanceData = {
        // Current stats
        averageResponseTime: latestResponseTime.average,
        p95ResponseTime: latestResponseTime.p95,
        p99ResponseTime: latestResponseTime.p99,
        
        totalRequests: requestsHistory.reduce((sum, item) => sum + item.total, 0),
        requestsPerMinute: Math.floor(latestRequests.total / 60),
        errorRate: Math.round((latestRequests.errors / latestRequests.total) * 100 * 10) / 10,
        
        cpuUsage: latestResources.cpu,
        memoryUsage: latestResources.memory,
        diskUsage: latestResources.disk,
        
        // Historical data
        responseTimeHistory,
        requestsHistory,
        resourceUsageHistory,
        
        // Endpoint performance
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
        
        // Time range used for this data
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

// Helper function to generate time series data
function generateTimeSeriesData(startDate: Date, endDate: Date, dataGenerator: (date: Date) => any) {
  const data = [];
  const interval = getIntervalFromDateRange(startDate, endDate);
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    data.push(dataGenerator(new Date(currentDate)));
    currentDate = addTimeInterval(currentDate, interval);
  }
  
  return data;
}

// Determine appropriate interval based on date range
function getIntervalFromDateRange(startDate: Date, endDate: Date) {
  const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  
  if (diffHours <= 12) return { minutes: 30 };
  if (diffHours <= 24) return { hours: 1 };
  if (diffHours <= 24 * 7) return { hours: 6 };
  return { days: 1 };
}

// Add time interval to a date
function addTimeInterval(date: Date, interval: { minutes?: number, hours?: number, days?: number }) {
  const newDate = new Date(date);
  if (interval.minutes) newDate.setMinutes(date.getMinutes() + interval.minutes);
  if (interval.hours) newDate.setHours(date.getHours() + interval.hours);
  if (interval.days) newDate.setDate(date.getDate() + interval.days);
  return newDate;
}