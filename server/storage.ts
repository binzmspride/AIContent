import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, asc, sql, like, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { ApiResponse } from "@shared/types";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<schema.User | null>;
  getUserByUsername(username: string): Promise<schema.User | null>;
  getUserByVerificationToken(token: string): Promise<schema.User | null>;
  getUserByResetPasswordToken(token: string): Promise<schema.User | null>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, data: Partial<schema.User>): Promise<schema.User | null>;
  updateUserPassword(id: number, newPassword: string): Promise<schema.User | null>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(page: number, limit: number): Promise<{ users: schema.User[], total: number }>;
  
  // Article management
  getArticle(id: number): Promise<schema.Article | null>;
  getArticleById(id: number): Promise<schema.Article | null>;
  getArticlesByUser(userId: number, page: number, limit: number, status?: string): Promise<{ articles: schema.Article[], total: number }>;
  createArticle(article: schema.InsertArticle): Promise<schema.Article>;
  updateArticle(id: number, data: Partial<schema.Article>): Promise<schema.Article | null>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Connection management
  getConnections(userId: number): Promise<schema.Connection[]>;
  getConnection(id: number): Promise<schema.Connection | null>;
  createConnection(connection: schema.InsertConnection): Promise<schema.Connection>;
  updateConnection(id: number, data: Partial<schema.Connection>): Promise<schema.Connection | null>;
  deleteConnection(id: number): Promise<boolean>;
  
  // Plan management
  getPlans(type?: schema.PlanType): Promise<schema.Plan[]>;
  getPlan(id: number): Promise<schema.Plan | null>;
  createPlan(plan: schema.InsertPlan): Promise<schema.Plan>;
  updatePlan(id: number, data: Partial<schema.Plan>): Promise<schema.Plan | null>;
  deletePlan(id: number): Promise<boolean>;
  getUserPlans(userId: number): Promise<(schema.UserPlan & { plan: schema.Plan })[]>;
  createUserPlan(userPlan: schema.InsertUserPlan): Promise<schema.UserPlan>;
  assignPlanToUser(userId: number, planId: number): Promise<schema.UserPlan>;
  
  // Credit transactions
  getUserCredits(userId: number): Promise<number>;
  addUserCredits(userId: number, amount: number, planId?: number, description?: string): Promise<number>;
  subtractUserCredits(userId: number, amount: number, description: string): Promise<number>;
  getCreditHistory(userId: number, page: number, limit: number): Promise<{ transactions: schema.CreditTransaction[], total: number }>;
  
  // System settings
  getSetting(key: string): Promise<string | null>;
  getSettingsByCategory(category: string): Promise<Record<string, string>>;
  setSetting(key: string, value: string, category?: string): Promise<boolean>;
  getSmtpSettings(): Promise<{
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    emailSender: string;
  } | null>;
  
  // API key management
  getApiKey(id: number): Promise<schema.ApiKey | null>;
  getApiKeyByKey(key: string): Promise<schema.ApiKey | null>;
  createApiKey(userId: number, name: string, scopes: string[]): Promise<{ key: string; secret: string; id: number; name: string }>;
  updateApiKey(id: number, userId: number, data: Partial<schema.ApiKey>): Promise<schema.ApiKey | null>;
  deleteApiKey(id: number, userId: number): Promise<boolean>;
  getApiKeys(userId: number): Promise<schema.ApiKey[]>;
  
  // Image management
  getImagesByUser(userId: number, page: number, limit: number): Promise<{ images: schema.Image[], total: number }>;
  getImageById(id: number): Promise<schema.Image | null>;
  createImage(image: schema.InsertImage): Promise<schema.Image>;
  updateImage(id: number, data: Partial<schema.Image>): Promise<schema.Image | null>;
  deleteImage(id: number): Promise<boolean>;
  
  // Workspace management
  getUserWorkspaces(userId: number): Promise<any[]>;
  createWorkspace(workspace: schema.InsertWorkspace): Promise<schema.Workspace>;
  getWorkspace(id: number): Promise<schema.Workspace | null>;
  isWorkspaceMember(workspaceId: number, userId: number): Promise<boolean>;
  addWorkspaceMember(member: schema.InsertWorkspaceMember): Promise<schema.WorkspaceMember>;
  getWorkspaceMembers(workspaceId: number): Promise<any[]>;
  getWorkspaceMemberRole(workspaceId: number, userId: number): Promise<string | null>;
  getWorkspaceSessions(workspaceId: number): Promise<any[]>;
  createCollaborativeSession(session: schema.InsertCollaborativeSession): Promise<schema.CollaborativeSession>;
  
  // Social Media & Scheduling management
  getSocialConnections(userId: number): Promise<schema.SocialConnection[]>;
  getSocialConnection(id: number): Promise<schema.SocialConnection | null>;
  createSocialConnection(connection: schema.InsertSocialConnection): Promise<schema.SocialConnection>;
  updateSocialConnection(id: number, data: Partial<schema.SocialConnection>): Promise<schema.SocialConnection | null>;
  deleteSocialConnection(id: number): Promise<boolean>;
  
  getScheduledPosts(userId: number, options?: { page?: number; limit?: number; status?: string }): Promise<{ posts: schema.ScheduledPost[], total: number }>;
  getScheduledPost(id: number): Promise<schema.ScheduledPost | null>;
  createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost>;
  updateScheduledPost(id: number, data: Partial<schema.ScheduledPost>): Promise<schema.ScheduledPost | null>;
  deleteScheduledPost(id: number): Promise<boolean>;
  
  getPostTemplates(userId: number, platform?: string): Promise<schema.PostTemplate[]>;
  getPostTemplate(id: number): Promise<schema.PostTemplate | null>;
  createPostTemplate(template: schema.InsertPostTemplate): Promise<schema.PostTemplate>;
  updatePostTemplate(id: number, data: Partial<schema.PostTemplate>): Promise<schema.PostTemplate | null>;
  deletePostTemplate(id: number): Promise<boolean>;
  
  // Publishing logs
  createPublishingLog(log: schema.InsertPublishingLog): Promise<schema.PublishingLog>;
  getPublishingLogs(scheduledPostId: number): Promise<schema.PublishingLog[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }
  
  // User management
  async getUser(id: number): Promise<schema.User | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    return user || null;
  }
  
  async getUserByUsername(usernameOrEmail: string): Promise<schema.User | null> {
    try {
      // Check if the input is an email (contains @)
      if (usernameOrEmail.includes('@')) {
        // Search by email
        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, usernameOrEmail)
        });
        return user || null;
      } else {
        // Search by username
        const user = await db.query.users.findFirst({
          where: eq(schema.users.username, usernameOrEmail)
        });
        return user || null;
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
      return null;
    }
  }
  
  async getUserByVerificationToken(token: string): Promise<schema.User | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.verificationToken, token)
      });
      return user || null;
    } catch (error) {
      console.error("Error retrieving user by verification token:", error);
      return null;
    }
  }
  
  async getUserByResetPasswordToken(token: string): Promise<schema.User | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.resetPasswordToken, token)
      });
      return user || null;
    } catch (error) {
      console.error("Error retrieving user by reset password token:", error);
      return null;
    }
  }
  
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users)
      .values(user)
      .returning();
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<schema.User>): Promise<schema.User | null> {
    const [updatedUser] = await db.update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser || null;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<schema.User | null> {
    try {
      // Hash password first
      const scryptAsync = promisify(scrypt);
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(newPassword, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Update user with new password
      const [updatedUser] = await db.update(schema.users)
        .set({ 
          password: hashedPassword, 
          updatedAt: new Date() 
        })
        .where(eq(schema.users.id, id))
        .returning();
      
      return updatedUser || null;
    } catch (error) {
      console.error("Error updating user password:", error);
      return null;
    }
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      // Delete all related records first to maintain referential integrity
      
      // Delete user's articles
      await db.delete(schema.articles)
        .where(eq(schema.articles.userId, id));
      
      // Delete user's connections
      await db.delete(schema.connections)
        .where(eq(schema.connections.userId, id));
      
      // Delete user's credit transactions
      await db.delete(schema.creditTransactions)
        .where(eq(schema.creditTransactions.userId, id));
      
      // Delete user's plans
      await db.delete(schema.userPlans)
        .where(eq(schema.userPlans.userId, id));
      
      // Finally delete the user
      await db.delete(schema.users)
        .where(eq(schema.users.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  
  async listUsers(page: number = 1, limit: number = 10): Promise<{ users: schema.User[], total: number }> {
    const offset = (page - 1) * limit;
    
    const users = await db.query.users.findMany({
      limit,
      offset,
      orderBy: [desc(schema.users.createdAt)]
    });
    
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(schema.users);
    
    return { users, total: count };
  }
  
  // Article management
  async getArticle(id: number): Promise<schema.Article | null> {
    const article = await db.query.articles.findFirst({
      where: eq(schema.articles.id, id)
    });
    return article || null;
  }
  
  async getArticlesByUser(userId: number, page: number = 1, limit: number = 10, status?: string): Promise<{ articles: schema.Article[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Tạo câu truy vấn cơ bản
    let query = db.query.articles;
    
    // Xác định hàm WHERE
    let whereCondition;
    
    if (status) {
      whereCondition = ({ userId: userIdCol, status: statusCol }) => 
        and(eq(userIdCol, userId), eq(statusCol, status as any));
    } else {
      whereCondition = ({ userId: userIdCol }) => eq(userIdCol, userId);
    }
    
    // Lấy bài viết với điều kiện WHERE
    const articles = await query.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: [desc(schema.articles.createdAt)],
    });
    
    // Đếm tổng số bài viết
    let countQuery = db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(schema.articles);
    
    if (status) {
      countQuery = countQuery.where(
        and(
          eq(schema.articles.userId, userId),
          eq(schema.articles.status, status as any)
        )
      );
    } else {
      countQuery = countQuery.where(eq(schema.articles.userId, userId));
    }
    
    const [{ count }] = await countQuery;
    
    return { articles, total: count };
  }
  
  async createArticle(article: schema.InsertArticle): Promise<schema.Article> {
    const [newArticle] = await db.insert(schema.articles)
      .values(article)
      .returning();
    return newArticle;
  }
  
  async updateArticle(id: number, data: Partial<schema.Article>): Promise<schema.Article | null> {
    const [updatedArticle] = await db.update(schema.articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.articles.id, id))
      .returning();
    return updatedArticle || null;
  }
  
  async getArticleById(id: number): Promise<schema.Article | null> {
    const article = await db.query.articles.findFirst({
      where: eq(schema.articles.id, id)
    });
    return article || null;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(schema.articles)
      .where(eq(schema.articles.id, id));
    return true;
  }
  
  // Connection management
  async getConnections(userId: number): Promise<schema.Connection[]> {
    const connections = await db.query.connections.findMany({
      where: eq(schema.connections.userId, userId)
    });
    return connections;
  }
  
  async getConnection(id: number): Promise<schema.Connection | null> {
    const connection = await db.query.connections.findFirst({
      where: eq(schema.connections.id, id)
    });
    return connection || null;
  }
  
  async createConnection(connection: schema.InsertConnection): Promise<schema.Connection> {
    const [newConnection] = await db.insert(schema.connections)
      .values(connection)
      .returning();
    return newConnection;
  }
  
  async updateConnection(id: number, data: Partial<schema.Connection>): Promise<schema.Connection | null> {
    const [updatedConnection] = await db.update(schema.connections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.connections.id, id))
      .returning();
    return updatedConnection || null;
  }
  
  async deleteConnection(id: number): Promise<boolean> {
    await db.delete(schema.connections)
      .where(eq(schema.connections.id, id));
    return true;
  }
  
  // Plan management
  async getPlans(type?: schema.PlanType): Promise<schema.Plan[]> {
    if (type) {
      return db.query.plans.findMany({
        where: eq(schema.plans.type, type as any)
      });
    }
    return db.query.plans.findMany();
  }
  
  async getPlan(id: number): Promise<schema.Plan | null> {
    const plan = await db.query.plans.findFirst({
      where: eq(schema.plans.id, id)
    });
    return plan || null;
  }
  
  async createPlan(plan: schema.InsertPlan): Promise<schema.Plan> {
    try {
      const [newPlan] = await db.insert(schema.plans)
        .values({
          ...plan,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newPlan;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }
  
  async updatePlan(id: number, data: Partial<schema.Plan>): Promise<schema.Plan | null> {
    try {
      const [updatedPlan] = await db.update(schema.plans)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.plans.id, id))
        .returning();
      return updatedPlan || null;
    } catch (error) {
      console.error('Error updating plan:', error);
      return null;
    }
  }
  
  async deletePlan(id: number): Promise<boolean> {
    try {
      // Check if plan is used in any user plan
      const userPlansWithThisPlan = await db.query.userPlans.findMany({
        where: eq(schema.userPlans.planId, id)
      });
      
      if (userPlansWithThisPlan.length > 0) {
        throw new Error('Cannot delete plan that is assigned to users');
      }
      
      await db.delete(schema.plans)
        .where(eq(schema.plans.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }
  
  async getUserPlans(userId: number): Promise<(schema.UserPlan & { plan: schema.Plan })[]> {
    const userPlans = await db.query.userPlans.findMany({
      where: eq(schema.userPlans.userId, userId),
      with: { plan: true }
    });
    return userPlans;
  }
  
  async createUserPlan(userPlan: schema.InsertUserPlan): Promise<schema.UserPlan> {
    const [newUserPlan] = await db.insert(schema.userPlans)
      .values(userPlan)
      .returning();
    return newUserPlan;
  }
  
  async assignPlanToUser(userId: number, planId: number): Promise<schema.UserPlan> {
    // Check if user already has this plan
    const existingPlan = await db.query.userPlans.findFirst({
      where: and(
        eq(schema.userPlans.userId, userId),
        eq(schema.userPlans.planId, planId),
        eq(schema.userPlans.isActive, true)
      )
    });
    
    if (existingPlan) {
      return existingPlan;
    }
    
    // Get plan details to set end date
    const plan = await db.query.plans.findFirst({
      where: eq(schema.plans.id, planId)
    });
    
    let endDate = null;
    if (plan?.durationDays) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationDays);
    }
    
    // Create new user plan
    const [newUserPlan] = await db.insert(schema.userPlans)
      .values({
        userId,
        planId,
        startDate: new Date(),
        endDate,
        isActive: true,
        usedStorage: 0
      })
      .returning();
      
    return newUserPlan;
  }
  
  // Credit transactions
  async getUserCredits(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.credits || 0;
  }
  
  async addUserCredits(userId: number, amount: number, planId?: number, description: string = 'Credit purchase'): Promise<number> {
    // Add credits to user
    const [updatedUser] = await db.update(schema.users)
      .set({ 
        credits: sql`${schema.users.credits} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    // Record transaction
    await db.insert(schema.creditTransactions)
      .values({
        userId,
        amount,
        planId,
        description
      });
    
    return updatedUser.credits;
  }
  
  async subtractUserCredits(userId: number, amount: number, description: string): Promise<number> {
    // Verify user has enough credits
    const user = await this.getUser(userId);
    if (!user || user.credits < amount) {
      throw new Error('Insufficient credits');
    }
    
    // Subtract credits from user
    const [updatedUser] = await db.update(schema.users)
      .set({ 
        credits: sql`${schema.users.credits} - ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    // Record transaction
    await db.insert(schema.creditTransactions)
      .values({
        userId,
        amount: -amount,
        description
      });
    
    return updatedUser.credits;
  }
  
  async getCreditHistory(userId: number, page: number = 1, limit: number = 10): Promise<{ transactions: schema.CreditTransaction[], total: number }> {
    const offset = (page - 1) * limit;
    
    const transactions = await db.query.creditTransactions.findMany({
      where: eq(schema.creditTransactions.userId, userId),
      limit,
      offset,
      orderBy: [desc(schema.creditTransactions.createdAt)]
    });
    
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.userId, userId));
    
    return { transactions, total: count };
  }
  
  // System settings
  async getSetting(key: string): Promise<string | null> {
    try {
      const setting = await db.query.systemSettings.findFirst({
        where: eq(schema.systemSettings.key, key)
      });
      return setting?.value || null;
    } catch (error) {
      console.error(`Error retrieving setting [${key}]:`, error);
      return null;
    }
  }
  
  async getSettingsByCategory(category: string): Promise<Record<string, string>> {
    try {
      const settings = await db.query.systemSettings.findMany({
        where: eq(schema.systemSettings.category, category)
      });
      
      return settings.reduce((acc, setting) => {
        if (setting.value !== null) {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      console.error(`Error retrieving settings for category [${category}]:`, error);
      
      // Return default settings for specific categories when database isn't available
      if (category === 'smtp') {
        return {
          smtpServer: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
          smtpPort: process.env.SMTP_PORT || '587',
          smtpUsername: process.env.SMTP_USER || 'seoviet.ai@gmail.com',
          smtpPassword: process.env.SMTP_PASS || 'xsmtpsib-06c8a3d8ad2e8f8e943a94b144ba23befe0c4c2fafa01ebe02399f84fa1b10d4-bCqw0LpZkYWBFMGf',
          emailSender: process.env.SMTP_FROM || 'SEO AI Writer <seoviet.ai@gmail.com>'
        };
      }
      
      return {};
    }
  }
  
  async setSetting(key: string, value: string, category: string = 'general'): Promise<boolean> {
    try {
      // Check if the setting already exists
      const existingSetting = await db.query.systemSettings.findFirst({
        where: eq(schema.systemSettings.key, key)
      });
      
      if (existingSetting) {
        // Update existing setting, bao gồm cả category
        await db.update(schema.systemSettings)
          .set({ 
            value, 
            category, // cập nhật category khi cập nhật cài đặt
            updatedAt: new Date()
          })
          .where(eq(schema.systemSettings.key, key));
      } else {
        // Create new setting
        await db.insert(schema.systemSettings)
          .values({
            key,
            value,
            category
          });
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving setting [${key}]:`, error);
      return false;
    }
  }
  
  async getSmtpSettings(): Promise<{
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    emailSender: string;
  } | null> {
    try {
      const smtpSettings = await this.getSettingsByCategory('smtp');
      
      if (!smtpSettings.smtpServer || !smtpSettings.smtpUsername || !smtpSettings.smtpPassword) {
        return null;
      }
      
      return {
        smtpServer: smtpSettings.smtpServer,
        smtpPort: parseInt(smtpSettings.smtpPort || '587'),
        smtpUsername: smtpSettings.smtpUsername,
        smtpPassword: smtpSettings.smtpPassword,
        emailSender: smtpSettings.emailSender || `SEO AI Writer <${smtpSettings.smtpUsername}>`
      };
    } catch (error) {
      console.error('Error retrieving SMTP settings:', error);
      return null;
    }
  }
  
  // API key management
  async getApiKey(id: number): Promise<schema.ApiKey | null> {
    try {
      const apiKey = await db.query.apiKeys.findFirst({
        where: eq(schema.apiKeys.id, id)
      });
      return apiKey || null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }
  
  async getApiKeyByKey(key: string): Promise<schema.ApiKey | null> {
    try {
      const apiKey = await db.query.apiKeys.findFirst({
        where: eq(schema.apiKeys.key, key)
      });
      return apiKey || null;
    } catch (error) {
      console.error('Error getting API key by key:', error);
      return null;
    }
  }
  
  async createApiKey(userId: number, name: string, scopes: string[]): Promise<{ key: string; secret: string; id: number; name: string }> {
    try {
      // Generate API key and secret
      const key = `sk_${randomBytes(16).toString('hex')}`;
      const secret = randomBytes(32).toString('hex');
      
      const [newApiKey] = await db.insert(schema.apiKeys)
        .values({
          userId,
          name,
          key,
          secret,
          scopes,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return {
        key: newApiKey.key,
        secret: newApiKey.secret,
        id: newApiKey.id,
        name: newApiKey.name
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }
  
  async updateApiKey(id: number, userId: number, data: Partial<schema.ApiKey>): Promise<schema.ApiKey | null> {
    try {
      const [updatedApiKey] = await db.update(schema.apiKeys)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(and(eq(schema.apiKeys.id, id), eq(schema.apiKeys.userId, userId)))
        .returning();
      return updatedApiKey || null;
    } catch (error) {
      console.error('Error updating API key:', error);
      return null;
    }
  }
  
  async deleteApiKey(id: number, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(schema.apiKeys)
        .where(and(eq(schema.apiKeys.id, id), eq(schema.apiKeys.userId, userId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  }
  
  async getApiKeys(userId: number): Promise<schema.ApiKey[]> {
    try {
      const apiKeys = await db.query.apiKeys.findMany({
        where: eq(schema.apiKeys.userId, userId),
        orderBy: [desc(schema.apiKeys.createdAt)]
      });
      return apiKeys;
    } catch (error) {
      console.error('Error listing API keys:', error);
      return [];
    }
  }

  // Image management
  async getImagesByUser(userId: number, page: number, limit: number): Promise<{ images: schema.Image[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const images = await db.query.images.findMany({
        where: eq(schema.images.userId, userId),
        orderBy: [desc(schema.images.createdAt)],
        limit,
        offset,
        with: {
          article: true
        }
      });
      
      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(schema.images)
        .where(eq(schema.images.userId, userId));
      
      const total = totalResult[0]?.count || 0;
      
      return { images, total };
    } catch (error) {
      console.error('Error fetching user images:', error);
      return { images: [], total: 0 };
    }
  }

  async getImageById(id: number): Promise<schema.Image | null> {
    try {
      const image = await db.query.images.findFirst({
        where: eq(schema.images.id, id),
        with: {
          user: true,
          article: true
        }
      });
      return image || null;
    } catch (error) {
      console.error('Error fetching image by ID:', error);
      return null;
    }
  }

  async createImage(image: schema.InsertImage): Promise<schema.Image> {
    try {
      const [newImage] = await db.insert(schema.images)
        .values({
          ...image,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newImage;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  }

  async updateImage(id: number, data: Partial<schema.Image>): Promise<schema.Image | null> {
    try {
      const [updatedImage] = await db.update(schema.images)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.images.id, id))
        .returning();
      return updatedImage || null;
    } catch (error) {
      console.error('Error updating image:', error);
      return null;
    }
  }

  async deleteImage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(schema.images)
        .where(eq(schema.images.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Workspace methods
  async getUserWorkspaces(userId: number): Promise<any[]> {
    try {
      const workspaces = await db.query.workspaceMembers.findMany({
        where: eq(schema.workspaceMembers.userId, userId),
        with: {
          workspace: {
            with: {
              owner: {
                columns: { username: true, fullName: true }
              }
            }
          }
        }
      });

      return workspaces.map(member => ({
        ...member.workspace,
        memberCount: 0, // TODO: Add member count query
        role: member.role
      }));
    } catch (error) {
      console.error('Error fetching user workspaces:', error);
      return [];
    }
  }

  async createWorkspace(workspace: schema.InsertWorkspace): Promise<schema.Workspace> {
    try {
      const [newWorkspace] = await db.insert(schema.workspaces)
        .values({
          ...workspace,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  async getWorkspace(id: number): Promise<schema.Workspace | null> {
    try {
      const workspace = await db.query.workspaces.findFirst({
        where: eq(schema.workspaces.id, id)
      });
      return workspace || null;
    } catch (error) {
      console.error('Error getting workspace:', error);
      return null;
    }
  }

  async isWorkspaceMember(workspaceId: number, userId: number): Promise<boolean> {
    try {
      const member = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(schema.workspaceMembers.workspaceId, workspaceId),
          eq(schema.workspaceMembers.userId, userId)
        )
      });
      return !!member;
    } catch (error) {
      console.error('Error checking workspace membership:', error);
      return false;
    }
  }

  async addWorkspaceMember(member: schema.InsertWorkspaceMember): Promise<schema.WorkspaceMember> {
    try {
      const [newMember] = await db.insert(schema.workspaceMembers)
        .values({
          ...member,
          joinedAt: new Date(),
          lastActiveAt: new Date()
        })
        .returning();
      return newMember;
    } catch (error) {
      console.error('Error adding workspace member:', error);
      throw error;
    }
  }

  async getWorkspaceMembers(workspaceId: number): Promise<any[]> {
    try {
      const members = await db.query.workspaceMembers.findMany({
        where: eq(schema.workspaceMembers.workspaceId, workspaceId),
        with: {
          user: {
            columns: { id: true, username: true, fullName: true, profileImageUrl: true }
          }
        }
      });
      return members;
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      return [];
    }
  }

  async getWorkspaceMemberRole(workspaceId: number, userId: number): Promise<string | null> {
    try {
      const member = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(schema.workspaceMembers.workspaceId, workspaceId),
          eq(schema.workspaceMembers.userId, userId)
        )
      });
      return member?.role || null;
    } catch (error) {
      console.error('Error getting workspace member role:', error);
      return null;
    }
  }

  async getWorkspaceSessions(workspaceId: number): Promise<any[]> {
    try {
      const sessions = await db.query.collaborativeSessions.findMany({
        where: eq(schema.collaborativeSessions.workspaceId, workspaceId),
        with: {
          creator: {
            columns: { username: true, fullName: true }
          }
        }
      });

      return sessions.map(session => ({
        ...session,
        imageCount: 0 // TODO: Add image count query
      }));
    } catch (error) {
      console.error('Error fetching workspace sessions:', error);
      return [];
    }
  }

  async createCollaborativeSession(session: schema.InsertCollaborativeSession): Promise<schema.CollaborativeSession> {
    try {
      const [newSession] = await db.insert(schema.collaborativeSessions)
        .values({
          ...session,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newSession;
    } catch (error) {
      console.error('Error creating collaborative session:', error);
      throw error;
    }
  }

  // Social Media & Scheduling management
  async getSocialConnections(userId: number): Promise<schema.SocialConnection[]> {
    try {
      const connections = await db.query.socialConnections.findMany({
        where: eq(schema.socialConnections.userId, userId),
        orderBy: desc(schema.socialConnections.createdAt)
      });
      return connections;
    } catch (error) {
      console.error('Error fetching social connections:', error);
      return [];
    }
  }

  async getSocialConnection(id: number): Promise<schema.SocialConnection | null> {
    try {
      const connection = await db.query.socialConnections.findFirst({
        where: eq(schema.socialConnections.id, id)
      });
      return connection || null;
    } catch (error) {
      console.error('Error fetching social connection:', error);
      return null;
    }
  }

  async createSocialConnection(connection: schema.InsertSocialConnection): Promise<schema.SocialConnection> {
    try {
      const [newConnection] = await db.insert(schema.socialConnections)
        .values({
          ...connection,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newConnection;
    } catch (error) {
      console.error('Error creating social connection:', error);
      throw error;
    }
  }

  async updateSocialConnection(id: number, data: Partial<schema.SocialConnection>): Promise<schema.SocialConnection | null> {
    try {
      const [updatedConnection] = await db.update(schema.socialConnections)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.socialConnections.id, id))
        .returning();
      return updatedConnection || null;
    } catch (error) {
      console.error('Error updating social connection:', error);
      return null;
    }
  }

  async deleteSocialConnection(id: number): Promise<boolean> {
    try {
      await db.delete(schema.socialConnections)
        .where(eq(schema.socialConnections.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting social connection:', error);
      return false;
    }
  }

  async getScheduledPosts(userId: number, options?: { page?: number; limit?: number; status?: string }): Promise<{ posts: schema.ScheduledPost[], total: number }> {
    try {
      const { page = 1, limit = 10, status } = options || {};
      const offset = (page - 1) * limit;

      let whereClause = eq(schema.scheduledPosts.userId, userId);
      if (status && status !== 'all') {
        whereClause = and(whereClause, eq(schema.scheduledPosts.status, status as any));
      }

      const [posts, totalResult] = await Promise.all([
        db.query.scheduledPosts.findMany({
          where: whereClause,
          orderBy: desc(schema.scheduledPosts.scheduledTime),
          limit: limit,
          offset: offset,
          with: {
            article: true
          }
        }),
        db.select({ count: sql`count(*)`.mapWith(Number) })
          .from(schema.scheduledPosts)
          .where(whereClause)
      ]);

      return {
        posts,
        total: totalResult[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      return { posts: [], total: 0 };
    }
  }

  async getScheduledPost(id: number): Promise<schema.ScheduledPost | null> {
    try {
      const post = await db.query.scheduledPosts.findFirst({
        where: eq(schema.scheduledPosts.id, id),
        with: {
          article: true,
          analytics: true
        }
      });
      return post || null;
    } catch (error) {
      console.error('Error fetching scheduled post:', error);
      return null;
    }
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    try {
      const [newPost] = await db.insert(schema.scheduledPosts)
        .values({
          ...post,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newPost;
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      throw error;
    }
  }

  async updateScheduledPost(id: number, data: Partial<schema.ScheduledPost>): Promise<schema.ScheduledPost | null> {
    try {
      const [updatedPost] = await db.update(schema.scheduledPosts)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.scheduledPosts.id, id))
        .returning();
      return updatedPost || null;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      return null;
    }
  }

  async deleteScheduledPost(id: number): Promise<boolean> {
    try {
      await db.delete(schema.scheduledPosts)
        .where(eq(schema.scheduledPosts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      return false;
    }
  }

  async getPostTemplates(userId: number, platform?: string): Promise<schema.PostTemplate[]> {
    try {
      let whereClause = eq(schema.postTemplates.userId, userId);
      if (platform) {
        whereClause = and(whereClause, eq(schema.postTemplates.platform, platform as any));
      }

      const templates = await db.query.postTemplates.findMany({
        where: whereClause,
        orderBy: desc(schema.postTemplates.createdAt)
      });
      return templates;
    } catch (error) {
      console.error('Error fetching post templates:', error);
      return [];
    }
  }

  async getPostTemplate(id: number): Promise<schema.PostTemplate | null> {
    try {
      const template = await db.query.postTemplates.findFirst({
        where: eq(schema.postTemplates.id, id)
      });
      return template || null;
    } catch (error) {
      console.error('Error fetching post template:', error);
      return null;
    }
  }

  async createPostTemplate(template: schema.InsertPostTemplate): Promise<schema.PostTemplate> {
    try {
      const [newTemplate] = await db.insert(schema.postTemplates)
        .values({
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newTemplate;
    } catch (error) {
      console.error('Error creating post template:', error);
      throw error;
    }
  }

  async updatePostTemplate(id: number, data: Partial<schema.PostTemplate>): Promise<schema.PostTemplate | null> {
    try {
      const [updatedTemplate] = await db.update(schema.postTemplates)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(schema.postTemplates.id, id))
        .returning();
      return updatedTemplate || null;
    } catch (error) {
      console.error('Error updating post template:', error);
      return null;
    }
  }

  async deletePostTemplate(id: number): Promise<boolean> {
    try {
      await db.delete(schema.postTemplates)
        .where(eq(schema.postTemplates.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting post template:', error);
      return false;
    }
  }

  // Publishing logs implementation
  async createPublishingLog(log: schema.InsertPublishingLog): Promise<schema.PublishingLog> {
    try {
      const [newLog] = await db.insert(schema.publishingLogs)
        .values({
          ...log,
          timestamp: new Date()
        })
        .returning();
      return newLog;
    } catch (error) {
      console.error('Error creating publishing log:', error);
      throw error;
    }
  }

  async getPublishingLogs(scheduledPostId: number): Promise<schema.PublishingLog[]> {
    try {
      const logs = await db.query.publishingLogs.findMany({
        where: eq(schema.publishingLogs.scheduledPostId, scheduledPostId),
        orderBy: desc(schema.publishingLogs.timestamp)
      });
      return logs;
    } catch (error) {
      console.error('Error fetching publishing logs:', error);
      return [];
    }
  }

  // Publishing logs
  async createPublishingLog(log: {
    userId: number;
    connectionId: number;
    platform: string;
    content: string;
    imageUrls: string[];
    status: string;
    publishedAt: Date;
    result: any;
  }): Promise<any> {
    try {
      // For now, just log to console since publishing logs table doesn't exist yet
      console.log('Publishing log:', {
        userId: log.userId,
        platform: log.platform,
        status: log.status,
        publishedAt: log.publishedAt,
        result: log.result
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating publishing log:', error);
      throw error;
    }
  }
}

export const storage: IStorage = new DatabaseStorage();
