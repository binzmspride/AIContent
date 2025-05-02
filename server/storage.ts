import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, asc, sql, like, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { ApiResponse } from "@shared/types";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<schema.User | null>;
  getUserByUsername(username: string): Promise<schema.User | null>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, data: Partial<schema.User>): Promise<schema.User | null>;
  listUsers(page: number, limit: number): Promise<{ users: schema.User[], total: number }>;
  
  // Article management
  getArticle(id: number): Promise<schema.Article | null>;
  getArticlesByUser(userId: number, page: number, limit: number): Promise<{ articles: schema.Article[], total: number }>;
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
  getUserPlans(userId: number): Promise<(schema.UserPlan & { plan: schema.Plan })[]>;
  createUserPlan(userPlan: schema.InsertUserPlan): Promise<schema.UserPlan>;
  
  // Credit transactions
  getUserCredits(userId: number): Promise<number>;
  addUserCredits(userId: number, amount: number, planId?: number, description?: string): Promise<number>;
  subtractUserCredits(userId: number, amount: number, description: string): Promise<number>;
  getCreditHistory(userId: number, page: number, limit: number): Promise<{ transactions: schema.CreditTransaction[], total: number }>;
  
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
  
  async getUserByUsername(username: string): Promise<schema.User | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    return user || null;
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
  
  async getArticlesByUser(userId: number, page: number = 1, limit: number = 10): Promise<{ articles: schema.Article[], total: number }> {
    const offset = (page - 1) * limit;
    
    const articles = await db.query.articles.findMany({
      where: eq(schema.articles.userId, userId),
      limit,
      offset,
      orderBy: [desc(schema.articles.createdAt)]
    });
    
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(schema.articles)
      .where(eq(schema.articles.userId, userId));
    
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
        where: eq(schema.plans.type, type)
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
}

export const storage: IStorage = new DatabaseStorage();
