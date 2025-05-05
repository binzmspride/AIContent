import nodemailer from 'nodemailer';

// Biến toàn cục lưu cấu hình SMTP
let smtpConfig = {
  host: '',
  port: 587,
  secure: false,
  auth: {
    user: '',
    pass: ''
  },
  from: ''
};

// Hàm cập nhật cấu hình SMTP
export function updateSmtpConfig(config: {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailSender: string;
}) {
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

  console.log('SMTP configuration updated:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.auth.user,
    from: smtpConfig.from
  });

  return true;
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