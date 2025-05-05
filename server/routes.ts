import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import * as schema from "@shared/schema";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { ApiResponse, GenerateContentRequest, GenerateContentResponse, PlanType } from "@shared/types";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { updateSmtpConfig, testSmtpConnection } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  const httpServer = createServer(app);

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

  // Generate content (mock API for now)
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
      
      // In the real implementation, we would wait for the n8n webhook response
      // and then create the article and subtract credits
      
      res.json({ success: true, data: mockResponse });
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
  
  // Get performance metrics for the admin dashboard
  app.get('/api/admin/performance', async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      const timeRange = req.query.timeRange as string || '24h';
      
      // In a real application, this would fetch actual data from monitoring systems
      // For now, we'll return simulated data for demonstration purposes
      
      // Determine the number of data points and interval based on time range
      let historyPoints = 24;
      let intervalMs = 3600000; // 1 hour in milliseconds
      
      switch(timeRange) {
        case '6h':
          historyPoints = 12;
          intervalMs = 1800000; // 30 minutes
          break;
        case '12h':
          historyPoints = 24;
          intervalMs = 1800000; // 30 minutes
          break;
        case '7d':
          historyPoints = 28;
          intervalMs = 21600000; // 6 hours
          break;
        case '30d':
          historyPoints = 30;
          intervalMs = 86400000; // 1 day
          break;
        default: // 24h
          historyPoints = 24;
          intervalMs = 3600000; // 1 hour
      }
      
      // Generate historical data points
      const now = new Date();
      
      // Generate response time history with trend patterns
      const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
      let baseValue = 120; // Starting base value
      
      const responseTimeHistory = Array.from({ length: historyPoints }, (_, i) => {
        const timestamp = new Date(now.getTime() - (historyPoints - 1 - i) * intervalMs).toISOString();
        
        // Create a slight trend over time
        baseValue += trend * (Math.random() * 2);
        baseValue = Math.max(100, Math.min(250, baseValue)); // Keep within reasonable bounds
        
        // Add daily pattern (slower in peak hours)
        const hour = new Date(timestamp).getHours();
        const hourFactor = hour >= 9 && hour <= 17 ? 1.2 : 0.9; // Business hours are slower
        
        const avgTime = baseValue * hourFactor;
        
        return {
          timestamp,
          average: avgTime,
          p95: avgTime * 1.5 + Math.random() * 20,
          p99: avgTime * 2 + Math.random() * 30,
        };
      });
      
      // Generate request history with daily patterns
      const requestBase = 800;
      const requestsHistory = Array.from({ length: historyPoints }, (_, i) => {
        const timestamp = new Date(now.getTime() - (historyPoints - 1 - i) * intervalMs).toISOString();
        const date = new Date(timestamp);
        const hour = date.getHours();
        
        // Create a daily pattern (more requests during business hours)
        const hourMultiplier = hour >= 9 && hour <= 17 ? 1.5 : 0.7;
        // Weekend pattern (fewer requests on weekends)
        const dayOfWeek = date.getDay();
        const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;
        
        const totalRequests = Math.floor(requestBase * hourMultiplier * weekendFactor + Math.random() * 200);
        
        return {
          timestamp,
          total: totalRequests,
          errors: Math.floor(totalRequests * (0.01 + Math.random() * 0.03)), // 1-4% error rate
        };
      });
      
      // Generate resource usage history with correlations to request volume
      const resourceUsageHistory = requestsHistory.map(point => {
        // Create correlation between request volume and resource usage
        const requestLoad = point.total / 1500; // Normalize
        
        // Base values plus request correlation plus random variation
        const cpuBase = 25 + (requestLoad * 15) + (Math.random() * 15);
        const memoryBase = 40 + (requestLoad * 10) + (Math.random() * 10);
        const diskBase = 55 + (Math.random() * 10); // Disk less affected by request volume
        
        return {
          timestamp: point.timestamp,
          cpu: Math.min(95, cpuBase), // Cap at 95%
          memory: Math.min(95, memoryBase),
          disk: Math.min(95, diskBase),
        };
      });
      
      // Generate endpoint performance data
      const endpointPerformance = [
        { endpoint: "/api/articles", count: 5230, averageTime: 132, errorRate: 1.2 },
        { endpoint: "/api/user", count: 8450, averageTime: 88, errorRate: 0.8 },
        { endpoint: "/api/generate-content", count: 1820, averageTime: 2350, errorRate: 5.2 },
        { endpoint: "/api/admin/stats", count: 645, averageTime: 165, errorRate: 3.1 },
        { endpoint: "/api/plans", count: 1230, averageTime: 112, errorRate: 1.5 },
        { endpoint: "/api/dashboard/generate-content", count: 985, averageTime: 2480, errorRate: 4.8 },
        { endpoint: "/api/dashboard/articles", count: 3125, averageTime: 145, errorRate: 1.4 },
        { endpoint: "/api/dashboard/stats", count: 4210, averageTime: 98, errorRate: 0.9 },
      ];
      
      // Calculate aggregated metrics
      const totalReq = requestsHistory.reduce((sum, point) => sum + point.total, 0);
      const totalErrors = requestsHistory.reduce((sum, point) => sum + point.errors, 0);
      const avgResponseTime = responseTimeHistory.reduce((sum, point) => sum + point.average, 0) / responseTimeHistory.length;
      
      res.json({
        success: true,
        data: {
          // Current stats
          averageResponseTime: Math.round(avgResponseTime),
          p95ResponseTime: Math.round(responseTimeHistory[responseTimeHistory.length - 1].p95),
          p99ResponseTime: Math.round(responseTimeHistory[responseTimeHistory.length - 1].p99),
          
          totalRequests: totalReq,
          requestsPerMinute: Math.round(totalReq / (historyPoints * (intervalMs / 60000))),
          errorRate: Number(((totalErrors / totalReq) * 100).toFixed(1)),
          
          cpuUsage: Math.round(resourceUsageHistory[resourceUsageHistory.length - 1].cpu),
          memoryUsage: Math.round(resourceUsageHistory[resourceUsageHistory.length - 1].memory),
          diskUsage: Math.round(resourceUsageHistory[resourceUsageHistory.length - 1].disk),
          
          // Historical data
          responseTimeHistory,
          requestsHistory,
          resourceUsageHistory,
          
          // Endpoint performance
          endpointPerformance,
          
          // Time range used
          timeRange
        }
      });
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
      
      const { smtpServer, smtpPort, smtpUsername, smtpPassword, emailSender } = req.body;
      
      // In a real app, save these settings to your database
      // Here we're just sending back a success response as demo
      
      // Validate the settings structure
      if (!smtpServer || !smtpPort || !smtpUsername || !smtpPassword || !emailSender) {
        return res.status(400).json({ 
          success: false, 
          error: 'Tất cả thông tin SMTP là bắt buộc' 
        });
      }
      
      // Save the settings values
      // For this example, we'll assume they're saved successfully
      
      res.json({
        success: true,
        message: 'Cài đặt email đã được cập nhật thành công'
      });
    } catch (error) {
      console.error('Error updating email settings:', error);
      res.status(500).json({ success: false, error: 'Không thể cập nhật cài đặt email' });
    }
  });
  
  // Test email API
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
      
      // Check if we have the SendGrid API key
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu SENDGRID_API_KEY trong cấu hình. Vui lòng cung cấp key này để sử dụng tính năng gửi email.'
        });
      } else {
        // Trong môi trường thực tế, chúng ta sẽ gửi email bằng SendGrid
        // Đối với môi trường demo, chúng ta sẽ giả lập việc gửi email thành công
        
        console.log(`[DEMO] Sending test email to: ${email}`);
        console.log(`[DEMO] Using SMTP settings from configuration`);
        
        // Giả lập delay của việc gửi email
        await new Promise(resolve => setTimeout(resolve, 500));
        
        res.json({
          success: true,
          message: 'Email kiểm tra đã được gửi thành công (chế độ demo)'
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

  return httpServer;
}
