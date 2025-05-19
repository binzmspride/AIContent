import nodemailer from 'nodemailer';
import { storage } from './storage';
import { SmtpConfig } from '@shared/types';

// Global app configuration
export const appConfig = {
  baseUrl: process.env.APP_BASE_URL || 'http://localhost:5000'
};

// Function to update the base URL of the application
export async function updateAppBaseUrl(baseUrl: string): Promise<boolean> {
  try {
    // Update configuration in memory
    appConfig.baseUrl = baseUrl;
    console.log('App base URL updated in memory:', baseUrl);
    
    // Try to save configuration to the database
    try {
      await storage.setSetting('appBaseUrl', baseUrl, 'general');
      console.log('App base URL saved to database');
    } catch (dbError) {
      console.warn('Could not save app base URL to database, using memory only:', dbError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating app base URL:', error);
    return false;
  }
}

// Load base URL from database
async function loadAppBaseUrlFromDatabase() {
  try {
    const baseUrl = await storage.getSetting('appBaseUrl');
    if (baseUrl) {
      appConfig.baseUrl = baseUrl;
      console.log('App base URL loaded from database:', baseUrl);
    } else {
      console.log('No app base URL found in database, using default:', appConfig.baseUrl);
    }
  } catch (error) {
    console.error('Error loading app base URL from database:', error);
    console.log('Using default app base URL:', appConfig.baseUrl);
  }
}

// Load configuration at startup (but don't wait for it)
loadAppBaseUrlFromDatabase().catch(err => {
  console.warn('Failed to load app base URL, using defaults:', err.message);
});

// Global SMTP configuration
let smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'seoviet.ai@gmail.com',
    pass: process.env.SMTP_PASS || 'xsmtpsib-06c8a3d8ad2e8f8e943a94b144ba23befe0c4c2fafa01ebe02399f84fa1b10d4-bCqw0LpZkYWBFMGf'
  },
  from: process.env.SMTP_FROM || 'SEO AI Writer <seoviet.ai@gmail.com>'
};

// Load SMTP configuration from database
async function loadSmtpConfigFromDatabase() {
  try {
    const dbConfig = await storage.getSmtpSettings();
    if (dbConfig) {
      smtpConfig = {
        host: dbConfig.smtpServer,
        port: dbConfig.smtpPort,
        secure: dbConfig.smtpPort === 465,
        auth: {
          user: dbConfig.smtpUsername,
          pass: dbConfig.smtpPassword
        },
        from: dbConfig.emailSender
      };
      console.log('SMTP configuration loaded from database');
    } else {
      console.log('No SMTP configuration found in database, using default values');
    }
  } catch (error) {
    console.error('Error loading SMTP config from database:', error);
    console.log('Using default SMTP configuration');
  }
}

// Load configuration at startup (but don't wait for it)
loadSmtpConfigFromDatabase().catch(err => {
  console.warn('Failed to load SMTP config, using defaults:', err.message);
});

// Hàm cập nhật cấu hình SMTP
export async function updateSmtpConfig(config: {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailSender: string;
}): Promise<boolean> {
  try {
    // Cập nhật cấu hình trong bộ nhớ
    smtpConfig = {
      host: config.smtpServer,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword
      },
      from: config.emailSender
    };

    console.log('SMTP configuration updated in memory');

    // Lưu cấu hình vào cơ sở dữ liệu
    await storage.setSetting('smtpServer', config.smtpServer, 'smtp');
    await storage.setSetting('smtpPort', config.smtpPort.toString(), 'smtp');
    await storage.setSetting('smtpUsername', config.smtpUsername, 'smtp');
    await storage.setSetting('smtpPassword', config.smtpPassword, 'smtp');
    await storage.setSetting('emailSender', config.emailSender, 'smtp');

    console.log('SMTP configuration saved to database');
    
    return true;
  } catch (error) {
    console.error('Error updating SMTP configuration:', error);
    return false;
  }
}

// Hàm gửi email
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Kiểm tra cấu hình SMTP
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return {
        success: false,
        error: 'Cấu hình SMTP chưa được thiết lập'
      };
    }

    // Tạo transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      }
    });

    // Chuẩn bị nội dung email
    const mailOptions = {
      from: smtpConfig.from,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi gửi email'
    };
  }
}

// Hàm kiểm tra kết nối SMTP
export async function testSmtpConnection(testEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Kiểm tra cấu hình SMTP
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return {
        success: false,
        error: 'Cấu hình SMTP chưa được thiết lập'
      };
    }

    const result = await sendEmail({
      to: testEmail,
      subject: 'Kiểm tra kết nối SMTP',
      text: 'Đây là email kiểm tra kết nối SMTP từ SEOAIWriter.',
      html: '<p>Đây là email kiểm tra kết nối SMTP từ <strong>SEOAIWriter</strong>.</p>'
    });

    return result;
  } catch (error) {
    console.error('Error testing SMTP connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi kiểm tra kết nối SMTP'
    };
  }
}