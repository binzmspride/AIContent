import { pgTable, text, serial, integer, bigint, boolean, timestamp, pgEnum, jsonb, varchar, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const articleStatusEnum = pgEnum('article_status', ['draft', 'published', 'deleted']);
export const planTypeEnum = pgEnum('plan_type', ['credit', 'storage']);
export const connectionTypeEnum = pgEnum('connection_type', ['wordpress', 'facebook', 'tiktok', 'twitter']);
export const contentRequestStatusEnum = pgEnum('content_request_status', ['pending', 'processing', 'completed', 'failed']);

// Enum types for TypeScript
export type PlanType = 'credit' | 'storage';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name'),
  role: roleEnum('role').notNull().default('user'),
  credits: integer('credits').notNull().default(0),
  language: text('language').notNull().default('vi'),
  isVerified: boolean('is_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordTokenExpiry: timestamp('reset_password_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Plans table
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: planTypeEnum('type').notNull(),
  price: integer('price').notNull(),
  value: bigint('value', { mode: 'number' }).notNull(), // Credits or storage amount
  duration: integer('duration'), // In days, null means one-time purchase
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User plans table
export const userPlans = pgTable('user_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  planId: integer('plan_id').references(() => plans.id).notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').notNull().default(true),
  usedStorage: integer('used_storage').notNull().default(0), // in bytes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Articles table
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  keywords: text('keywords'),
  status: articleStatusEnum('status').notNull().default('draft'),
  publishedUrl: text('published_url'),
  creditsUsed: integer('credits_used').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User connections table (WordPress, social media)
export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: connectionTypeEnum('type').notNull(),
  name: text('name').notNull(),
  config: jsonb('config').notNull(), // Store connection details like URLs, tokens, etc.
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Credit transactions table
export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(), // Positive for purchases, negative for usage
  planId: integer('plan_id').references(() => plans.id),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// System settings table
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value'),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  connections: many(connections),
  userPlans: many(userPlans),
  creditTransactions: many(creditTransactions),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  userPlans: many(userPlans),
  creditTransactions: many(creditTransactions),
}));

export const userPlansRelations = relations(userPlans, ({ one }) => ({
  user: one(users, { fields: [userPlans.userId], references: [users.id] }),
  plan: one(plans, { fields: [userPlans.planId], references: [plans.id] }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  user: one(users, { fields: [articles.userId], references: [users.id] }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  user: one(users, { fields: [connections.userId], references: [users.id] }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, { fields: [creditTransactions.userId], references: [users.id] }),
  plan: one(plans, { fields: [creditTransactions.planId], references: [plans.id] }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.email("Must provide a valid email"),
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters")
}).omit({ id: true, createdAt: true, updatedAt: true });

export const userLoginSchema = z.object({
  username: z.string().email("Must provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertArticleSchema = createInsertSchema(articles, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
});

export const insertConnectionSchema = createInsertSchema(connections);
export const insertPlanSchema = createInsertSchema(plans);
export const insertUserPlanSchema = createInsertSchema(userPlans);
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions);

export const selectUserSchema = createSelectSchema(users);
export const selectArticleSchema = createSelectSchema(articles);
export const selectConnectionSchema = createSelectSchema(connections);
export const selectPlanSchema = createSelectSchema(plans);
export const selectUserPlanSchema = createSelectSchema(userPlans);
export const selectCreditTransactionSchema = createSelectSchema(creditTransactions);
export const selectSystemSettingSchema = createSelectSchema(systemSettings);
export const insertSystemSettingSchema = createInsertSchema(systemSettings, {
  key: (schema) => schema.min(1, "Key is required"),
  category: (schema) => schema.min(1, "Category is required"),
});

// Export types
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;

export type Article = z.infer<typeof selectArticleSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Connection = z.infer<typeof selectConnectionSchema>;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type Plan = z.infer<typeof selectPlanSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type UserPlan = z.infer<typeof selectUserPlanSchema>;
export type InsertUserPlan = z.infer<typeof insertUserPlanSchema>;

export type CreditTransaction = z.infer<typeof selectCreditTransactionSchema>;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;

export type SystemSetting = z.infer<typeof selectSystemSettingSchema>;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

// API Keys table for third-party integration
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  secret: text('secret').notNull(),
  scopes: text('scopes').array().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// API Keys relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

// Update user relations to include API keys
export const usersRelationsWithApiKeys = relations(users, ({ many }) => ({
  articles: many(articles),
  connections: many(connections),
  userPlans: many(userPlans),
  creditTransactions: many(creditTransactions),
  apiKeys: many(apiKeys),
}));

// API Keys schemas
export const selectApiKeySchema = createSelectSchema(apiKeys);
export const insertApiKeySchema = createInsertSchema(apiKeys);

// API Keys types
export type ApiKey = z.infer<typeof selectApiKeySchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
