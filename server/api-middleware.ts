import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { apiKeys } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * API key authentication middleware
 * 
 * This middleware validates the API key provided in the X-API-Key header.
 * If the key is valid, it attaches the API key info to the request object.
 * 
 * @param requiredScopes Optional array of scopes that the API key must have
 */
export function apiKeyAuth(requiredScopes?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.header('X-API-Key');
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key is required'
        });
      }

      // Find the API key in the database
      const [keyData] = await db
        .select()
        .from(apiKeys)
        .where(
          and(
            eq(apiKeys.key, apiKey),
            eq(apiKeys.isActive, true)
          )
        );

      if (!keyData) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
      }

      // Check expiration if set
      if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
        return res.status(401).json({
          success: false,
          error: 'API key has expired'
        });
      }

      // Check scopes if required
      if (requiredScopes && requiredScopes.length > 0) {
        const hasRequiredScopes = requiredScopes.every(scope => 
          keyData.scopes.includes(scope)
        );

        if (!hasRequiredScopes) {
          return res.status(403).json({
            success: false,
            error: 'API key does not have the required permissions'
          });
        }
      }

      // Update last used timestamp
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, keyData.id));

      // Attach API key info to request for later use
      (req as any).apiKey = keyData;
      
      next();
    } catch (error) {
      console.error('API key authentication error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during API key authentication'
      });
    }
  };
}

/**
 * Basic rate limiting middleware for API endpoints
 * 
 * This is a simple implementation. For production, consider using a more robust
 * solution like redis-based rate limiting or a dedicated service.
 */
export function apiRateLimit(limit: number, windowMs: number = 60000) {
  const windowRequests = new Map<string, { count: number, resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = (req as any).apiKey?.id || req.ip;
    const now = Date.now();
    
    if (!windowRequests.has(identifier)) {
      windowRequests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const requestData = windowRequests.get(identifier)!;
    
    // Reset if the window has passed
    if (now > requestData.resetTime) {
      windowRequests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    // Increment request count
    requestData.count++;
    
    // Check if over limit
    if (requestData.count > limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
    }

    next();
  };
}