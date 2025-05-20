import { Express, Request, Response } from 'express';
import { db, isDatabaseConnected } from '../db';
import { users } from '@shared/schema';
import { count } from 'drizzle-orm';
import { Pool } from 'pg';

/**
 * Đăng ký các route API trạng thái của hệ thống
 * 
 * @param app Express application instance
 */
export function registerStatusRoutes(app: Express) {
  /**
   * Kiểm tra trạng thái kết nối cơ sở dữ liệu
   */
  app.get('/api/status/database', async (req: Request, res: Response) => {
    try {
      // Kiểm tra kết nối database
      const connected = isDatabaseConnected();
      
      // Nếu kết nối thành công, thử thực hiện một truy vấn đơn giản
      let querySuccess = false;
      let userCount = 0;
      
      if (connected) {
        try {
          const result = await db.select({ value: count() }).from(users);
          userCount = result[0]?.value ?? 0;
          querySuccess = true;
        } catch (err) {
          console.error('Database query error:', err);
        }
      }
      
      // Trả về kết quả kiểm tra
      return res.status(200).json({
        success: true,
        data: {
          connected,
          querySuccess,
          status: connected && querySuccess ? 'online' : 'offline',
          userCount: querySuccess ? userCount : null,
          timestamp: new Date().toISOString(),
        },
        online: connected && querySuccess,
        message: connected && querySuccess ? "Database is online" : "Database is offline"
      });
    } catch (error) {
      console.error('Database status check error:', error);
      return res.status(500).json({
        success: false, 
        error: 'Failed to check database status',
        data: {
          status: 'offline',
          connected: false,
          querySuccess: false,
          timestamp: new Date().toISOString(),
        },
        online: false,
        message: "Failed to check database status"
      });
    }
  });

  /**
   * Kiểm tra toàn bộ trạng thái hệ thống
   */
  app.get('/api/status/system', async (req: Request, res: Response) => {
    try {
      // Kiểm tra kết nối database
      const dbConnected = isDatabaseConnected();
      
      // Các thông tin hệ thống khác
      const systemInfo = {
        version: process.env.APP_VERSION || '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      };
      
      return res.status(200).json({
        success: true,
        data: {
          database: {
            status: dbConnected ? 'online' : 'offline',
            connected: dbConnected,
          },
          system: systemInfo,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('System status check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check system status'
      });
    }
  });
}