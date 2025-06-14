import { pgTable, text, serial, integer, bigint, boolean, timestamp, pgEnum, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const articleStatusEnum = pgEnum('article_status', ['draft', 'published', 'deleted']);
export const planTypeEnum = pgEnum('plan_type', ['credit', 'storage']);
export const connectionTypeEnum = pgEnum('connection_type', ['wordpress', 'facebook', 'tiktok', 'twitter']);
export const aiProviderEnum = pgEnum('ai_provider', ['openai', 'claude', 'gemini']);

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
  type: text('type').notNull(),
  price: text('price').notNull(), // Changed to match database numeric type
  credits: integer('credits').notNull(),
  durationDays: integer('duration_days'),
  features: jsonb('features'),
  isActive: boolean('is_active').notNull().default(true),
  value: bigint('value', { mode: 'number' }).default(0),
  duration: integer('duration'),
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
  textContent: text('text_content'), // Pure text content without images
  imageUrls: jsonb('image_urls'), // Array of image URLs
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

// Update user relations to include API keys and images
export const usersRelationsWithApiKeys = relations(users, ({ many }) => ({
  articles: many(articles),
  connections: many(connections),
  userPlans: many(userPlans),
  creditTransactions: many(creditTransactions),
  apiKeys: many(apiKeys),
  images: many(images),
}));

// API Keys schemas
export const selectApiKeySchema = createSelectSchema(apiKeys);
export const insertApiKeySchema = createInsertSchema(apiKeys);

// API Keys types
export type ApiKey = z.infer<typeof selectApiKeySchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// Images table
export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  articleId: integer('article_id').references(() => articles.id),
  title: text('title').notNull(),
  prompt: text('prompt').notNull(),
  imageUrl: text('image_url').notNull(),
  sourceText: text('source_text'), // Text content from SEO article
  creditsUsed: integer('credits_used').notNull().default(1),
  status: text('status').notNull().default('generated'), // generated, approved, rejected
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Feedback table
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('unread'), // unread, read, replied
  page: text('page'), // Which page the feedback was submitted from
  userId: integer('user_id').references(() => users.id), // Optional if user is logged in
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Images relations
export const imagesRelations = relations(images, ({ one }) => ({
  user: one(users, { fields: [images.userId], references: [users.id] }),
  article: one(articles, { fields: [images.articleId], references: [articles.id] }),
}));

// Feedback relations
export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, { fields: [feedback.userId], references: [users.id] }),
}));

// Images schemas
export const selectImageSchema = createSelectSchema(images);
export const insertImageSchema = createInsertSchema(images, {
  title: (schema) => schema.min(1, "Title is required"),
  prompt: (schema) => schema.min(1, "Prompt is required"),
  imageUrl: (schema) => schema.url("Must be a valid URL"),
});

// Images types
export type Image = z.infer<typeof selectImageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;

// Feedback schemas
export const selectFeedbackSchema = createSelectSchema(feedback);
export const insertFeedbackSchema = createInsertSchema(feedback, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  subject: (schema) => schema.min(5, "Subject must be at least 5 characters"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
});

// Feedback types
export type Feedback = z.infer<typeof selectFeedbackSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Translations table
export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  vi: text('vi').notNull(),
  en: text('en').notNull(),
  category: text('category').notNull().default('common'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Translations schemas
export const selectTranslationSchema = createSelectSchema(translations);
export const insertTranslationSchema = createInsertSchema(translations, {
  key: (schema) => schema.min(1, "Key cannot be empty"),
  vi: (schema) => schema.min(1, "Vietnamese translation cannot be empty"),
  en: (schema) => schema.min(1, "English translation cannot be empty"),
  category: (schema) => schema.min(1, "Category cannot be empty"),
});

// Translation types
export type Translation = z.infer<typeof selectTranslationSchema>;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

// AI API Keys table
export const aiApiKeys = pgTable('ai_api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  provider: aiProviderEnum('provider').notNull(),
  apiKey: text('api_key').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI API Keys relations
export const aiApiKeysRelations = relations(aiApiKeys, ({ one }) => ({
  user: one(users, { fields: [aiApiKeys.userId], references: [users.id] }),
}));

// AI API Keys schemas
export const selectAiApiKeySchema = createSelectSchema(aiApiKeys);
export const insertAiApiKeySchema = createInsertSchema(aiApiKeys, {
  name: (schema) => schema.min(1, "Name cannot be empty"),
  apiKey: (schema) => schema.min(1, "API key cannot be empty"),
});

// AI API Keys types
export type AiApiKey = z.infer<typeof selectAiApiKeySchema>;
export type InsertAiApiKey = z.infer<typeof insertAiApiKeySchema>;

// Collaborative Workspace Enums
export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'admin', 'editor', 'viewer']);
export const workspaceStatusEnum = pgEnum('workspace_status', ['active', 'archived', 'deleted']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'completed', 'cancelled']);

// Workspaces table
export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  status: workspaceStatusEnum('status').notNull().default('active'),
  settings: jsonb('settings').default({}),
  inviteCode: text('invite_code').unique(),
  isPublic: boolean('is_public').notNull().default(false),
  maxMembers: integer('max_members').notNull().default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workspace Members table
export const workspaceMembers = pgTable('workspace_members', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: workspaceRoleEnum('role').notNull().default('viewer'),
  invitedBy: integer('invited_by').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
});

// Collaborative Sessions table
export const collaborativeSessions = pgTable('collaborative_sessions', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  status: sessionStatusEnum('status').notNull().default('active'),
  prompt: text('prompt'),
  imageStyle: text('image_style').notNull().default('realistic'),
  targetImageCount: integer('target_image_count').notNull().default(1),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Session Images table
export const sessionImages = pgTable('session_images', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => collaborativeSessions.id).notNull(),
  imageId: integer('image_id').references(() => images.id).notNull(),
  contributedBy: integer('contributed_by').references(() => users.id).notNull(),
  version: integer('version').notNull().default(1),
  isApproved: boolean('is_approved').notNull().default(false),
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Session Activity table
export const sessionActivity = pgTable('session_activity', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => collaborativeSessions.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  activityType: text('activity_type').notNull(), // joined, left, image_added, image_approved, etc.
  data: jsonb('data').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Workspace Relations
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  sessions: many(collaborativeSessions),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
  inviter: one(users, { fields: [workspaceMembers.invitedBy], references: [users.id] }),
}));

export const collaborativeSessionsRelations = relations(collaborativeSessions, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [collaborativeSessions.workspaceId], references: [workspaces.id] }),
  creator: one(users, { fields: [collaborativeSessions.createdBy], references: [users.id] }),
  sessionImages: many(sessionImages),
  activities: many(sessionActivity),
}));

export const sessionImagesRelations = relations(sessionImages, ({ one }) => ({
  session: one(collaborativeSessions, { fields: [sessionImages.sessionId], references: [collaborativeSessions.id] }),
  image: one(images, { fields: [sessionImages.imageId], references: [images.id] }),
  contributor: one(users, { fields: [sessionImages.contributedBy], references: [users.id] }),
  approver: one(users, { fields: [sessionImages.approvedBy], references: [users.id] }),
}));

export const sessionActivityRelations = relations(sessionActivity, ({ one }) => ({
  session: one(collaborativeSessions, { fields: [sessionActivity.sessionId], references: [collaborativeSessions.id] }),
  user: one(users, { fields: [sessionActivity.userId], references: [users.id] }),
}));

// Workspace Schemas
export const selectWorkspaceSchema = createSelectSchema(workspaces);
export const insertWorkspaceSchema = createInsertSchema(workspaces, {
  name: (schema) => schema.min(1, "Workspace name is required"),
  maxMembers: (schema) => schema.min(1, "Max members must be at least 1").max(100, "Max members cannot exceed 100"),
});

export const selectWorkspaceMemberSchema = createSelectSchema(workspaceMembers);
export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers);

export const selectCollaborativeSessionSchema = createSelectSchema(collaborativeSessions);
export const insertCollaborativeSessionSchema = createInsertSchema(collaborativeSessions, {
  name: (schema) => schema.min(1, "Session name is required"),
  targetImageCount: (schema) => schema.min(1, "Target image count must be at least 1").max(10, "Target image count cannot exceed 10"),
});

export const selectSessionImageSchema = createSelectSchema(sessionImages);
export const insertSessionImageSchema = createInsertSchema(sessionImages);

export const selectSessionActivitySchema = createSelectSchema(sessionActivity);
export const insertSessionActivitySchema = createInsertSchema(sessionActivity, {
  activityType: (schema) => schema.min(1, "Activity type is required"),
});

// Workspace Types
export type Workspace = z.infer<typeof selectWorkspaceSchema>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type WorkspaceMember = z.infer<typeof selectWorkspaceMemberSchema>;
export type InsertWorkspaceMember = z.infer<typeof insertWorkspaceMemberSchema>;
export type CollaborativeSession = z.infer<typeof selectCollaborativeSessionSchema>;
export type InsertCollaborativeSession = z.infer<typeof insertCollaborativeSessionSchema>;
export type SessionImage = z.infer<typeof selectSessionImageSchema>;
export type InsertSessionImage = z.infer<typeof insertSessionImageSchema>;
export type SessionActivity = z.infer<typeof selectSessionActivitySchema>;
export type InsertSessionActivity = z.infer<typeof insertSessionActivitySchema>;
