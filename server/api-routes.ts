import { Express, Request, Response } from 'express';
import { db } from '../db';
import { apiKeyAuth, apiRateLimit } from './api-middleware';
import { apiKeys, users, articles } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { storage } from './storage';

/**
 * Registers API routes for third-party integrations
 * 
 * These routes are separate from the main application routes and follow
 * RESTful API conventions. They support both public and private endpoints.
 */
export function registerApiRoutes(app: Express) {
  const apiPrefix = '/api/v1';

  // === Public API Endpoints (no auth required) ===
  
  // Public endpoint: get limited public info about the API
  app.get(`${apiPrefix}/info`, apiRateLimit(60), (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        name: "SEO AI Writer API",
        version: "1.0.0",
        description: "API for third-party integrations with SEO AI Writer",
        documentationUrl: "/api/docs"
      }
    });
  });

  // Public endpoint: status check
  app.get(`${apiPrefix}/status`, apiRateLimit(60), (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: "operational",
        timestamp: new Date().toISOString()
      }
    });
  });

  // === Private API Endpoints (API key required) ===
  
  // Get user info
  app.get(
    `${apiPrefix}/user`, 
    apiKeyAuth(['user:read']), 
    apiRateLimit(30),
    async (req: Request, res: Response) => {
      try {
        const apiKeyData = (req as any).apiKey;
        const userId = apiKeyData.userId;
        
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            credits: true,
            language: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true
          }
        });
        
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }
        
        res.json({
          success: true,
          data: user
        });
      } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );
  
  // Get user's articles
  app.get(
    `${apiPrefix}/articles`,
    apiKeyAuth(['articles:read']),
    apiRateLimit(30),
    async (req: Request, res: Response) => {
      try {
        const apiKeyData = (req as any).apiKey;
        const userId = apiKeyData.userId;
        
        // Parse pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        
        const articleResults = await storage.getArticlesByUser(userId, page, limit);
        
        res.json({
          success: true,
          data: {
            articles: articleResults.articles,
            pagination: {
              page,
              limit,
              total: articleResults.total,
              totalPages: Math.ceil(articleResults.total / limit)
            }
          }
        });
      } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );
  
  // Get article by ID
  app.get(
    `${apiPrefix}/articles/:id`,
    apiKeyAuth(['articles:read']),
    apiRateLimit(60),
    async (req: Request, res: Response) => {
      try {
        const apiKeyData = (req as any).apiKey;
        const userId = apiKeyData.userId;
        const articleId = parseInt(req.params.id);
        
        if (isNaN(articleId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid article ID'
          });
        }
        
        const article = await db.query.articles.findFirst({
          where: and(
            eq(articles.id, articleId),
            eq(articles.userId, userId)
          )
        });
        
        if (!article) {
          return res.status(404).json({
            success: false,
            error: 'Article not found'
          });
        }
        
        res.json({
          success: true,
          data: article
        });
      } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );
  
  // Get user's credit balance
  app.get(
    `${apiPrefix}/credits`,
    apiKeyAuth(['credits:read']),
    apiRateLimit(30),
    async (req: Request, res: Response) => {
      try {
        const apiKeyData = (req as any).apiKey;
        const userId = apiKeyData.userId;
        
        const credits = await storage.getUserCredits(userId);
        
        res.json({
          success: true,
          data: {
            credits
          }
        });
      } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );
  
  // === API Keys Management Endpoints ===
  
  // Create a new API key (requires authenticated session)
  app.post('/api/keys', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const { name, scopes } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        });
      }
      
      // Generate unique API key and secret
      const key = `seo_${nanoid(32)}`;
      const secret = nanoid(64);
      
      // Default scopes if not provided
      const defaultScopes = ['user:read', 'articles:read', 'credits:read'];
      const apiScopes = scopes || defaultScopes;
      
      // Create the API key
      const [newApiKey] = await db.insert(apiKeys).values({
        userId: req.user!.id,
        name,
        key,
        secret,
        scopes: apiScopes,
        // Bỏ trường expiresAt vì không có trong cơ sở dữ liệu
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json({
        success: true,
        data: {
          id: newApiKey.id,
          name: newApiKey.name,
          key: newApiKey.key,
          secret: newApiKey.secret, // Only show secret on creation
          scopes: newApiKey.scopes
          // Không trả về expiresAt vì không có trong DB
        },
        message: 'API key created successfully. The secret will only be shown once, please store it securely.'
      });
    } catch (error) {
      console.error('API key creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // List user's API keys (requires authenticated session)
  app.get('/api/keys', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const keys = await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          key: apiKeys.key,
          scopes: apiKeys.scopes,
          isActive: apiKeys.isActive,
          // Không chọn expiresAt vì có thể không tồn tại cột này trong DB
          lastUsedAt: apiKeys.lastUsedAt,
          createdAt: apiKeys.createdAt
        })
        .from(apiKeys)
        .where(eq(apiKeys.userId, req.user!.id))
        .orderBy(desc(apiKeys.createdAt));
      
      res.json({
        success: true,
        data: keys
      });
    } catch (error) {
      console.error('API keys retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Update an API key (requires authenticated session)
  app.patch('/api/keys/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const keyId = parseInt(req.params.id);
      if (isNaN(keyId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid API key ID'
        });
      }
      
      // Get the API key and verify ownership
      const key = await db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.id, keyId),
          eq(apiKeys.userId, req.user!.id)
        )
      });
      
      if (!key) {
        return res.status(404).json({
          success: false,
          error: 'API key not found'
        });
      }
      
      // Update the API key
      const { name, scopes, isActive } = req.body;
      const updateData: any = { updatedAt: new Date() };
      
      if (name !== undefined) updateData.name = name;
      if (scopes !== undefined) updateData.scopes = scopes;
      if (isActive !== undefined) updateData.isActive = isActive;
      // Bỏ xử lý expiresAt vì không có cột này trong DB
      
      const [updatedKey] = await db
        .update(apiKeys)
        .set(updateData)
        .where(eq(apiKeys.id, keyId))
        .returning();
      
      res.json({
        success: true,
        data: {
          id: updatedKey.id,
          name: updatedKey.name,
          key: updatedKey.key,
          scopes: updatedKey.scopes,
          isActive: updatedKey.isActive,
          // Không trả về expiresAt vì không có cột này trong DB
          lastUsedAt: updatedKey.lastUsedAt,
          createdAt: updatedKey.createdAt,
          updatedAt: updatedKey.updatedAt
        }
      });
    } catch (error) {
      console.error('API key update error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Delete an API key (requires authenticated session)
  app.delete('/api/keys/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const keyId = parseInt(req.params.id);
      if (isNaN(keyId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid API key ID'
        });
      }
      
      // Get the API key and verify ownership
      const key = await db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.id, keyId),
          eq(apiKeys.userId, req.user!.id)
        )
      });
      
      if (!key) {
        return res.status(404).json({
          success: false,
          error: 'API key not found'
        });
      }
      
      // Delete the API key
      await db
        .delete(apiKeys)
        .where(eq(apiKeys.id, keyId));
      
      res.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error) {
      console.error('API key deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // API Documentation endpoint
  app.get('/api/docs', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        documentation: [
          {
            title: "Authentication",
            description: "To access private API endpoints, include your API key in the X-API-Key header."
          },
          {
            title: "Rate Limiting",
            description: "API requests are rate limited to protect the service. If you exceed limits, you'll receive a 429 status code."
          },
          {
            title: "Public Endpoints",
            endpoints: [
              { 
                method: "GET", 
                path: "/api/v1/info", 
                description: "Get API information"
              },
              { 
                method: "GET", 
                path: "/api/v1/status", 
                description: "Check API status"
              }
            ]
          },
          {
            title: "Private Endpoints",
            endpoints: [
              { 
                method: "GET", 
                path: "/api/v1/user", 
                description: "Get user information",
                requiredScope: "user:read"
              },
              { 
                method: "GET", 
                path: "/api/v1/articles", 
                description: "List user's articles",
                requiredScope: "articles:read"
              },
              { 
                method: "GET", 
                path: "/api/v1/articles/:id", 
                description: "Get specific article by ID",
                requiredScope: "articles:read"
              },
              { 
                method: "GET", 
                path: "/api/v1/credits", 
                description: "Get user's credit balance",
                requiredScope: "credits:read"
              }
            ]
          },
          {
            title: "API Key Management",
            endpoints: [
              { 
                method: "POST", 
                path: "/api/keys", 
                description: "Create a new API key (requires authenticated session)"
              },
              { 
                method: "GET", 
                path: "/api/keys", 
                description: "List all API keys (requires authenticated session)"
              },
              { 
                method: "PATCH", 
                path: "/api/keys/:id", 
                description: "Update an API key (requires authenticated session)"
              },
              { 
                method: "DELETE", 
                path: "/api/keys/:id", 
                description: "Delete an API key (requires authenticated session)"
              }
            ]
          }
        ]
      }
    });
  });
}