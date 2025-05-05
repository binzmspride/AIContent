// Email templates for various notifications

export function getVerificationEmailTemplate(options: {
  username: string;
  verificationUrl: string;
}): { subject: string; html: string; text: string } {
  const { username, verificationUrl } = options;
  
  const subject = 'Xác nhận tài khoản SEOAIWriter của bạn';
  
  const html = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">SEOAIWriter</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
      <h2 style="color: #1e3a8a;">Xác nhận địa chỉ email của bạn</h2>
      <p>Chào ${username},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản SEOAIWriter. Để hoàn tất quá trình đăng ký, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Xác nhận Email</a>
      </div>
      <p>Hoặc bạn có thể copy và dán đường dẫn này vào trình duyệt của bạn:</p>
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
      <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
      <p>Nếu bạn không đăng ký tài khoản tại SEOAIWriter, bạn có thể bỏ qua email này.</p>
      <p>Trân trọng,<br>Đội ngũ SEOAIWriter</p>
    </div>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      <p>© ${new Date().getFullYear()} SEOAIWriter. Tất cả các quyền được bảo lưu.</p>
    </div>
  </div>
  `;
  
  const text = `
Xác nhận tài khoản SEOAIWriter của bạn

Chào ${username},

Cảm ơn bạn đã đăng ký tài khoản SEOAIWriter. Để hoàn tất quá trình đăng ký, vui lòng truy cập vào liên kết sau để xác nhận địa chỉ email của bạn:

${verificationUrl}

Liên kết này sẽ hết hạn sau 24 giờ.

Nếu bạn không đăng ký tài khoản tại SEOAIWriter, bạn có thể bỏ qua email này.

Trân trọng,
Đội ngũ SEOAIWriter
  `;
  
  return { subject, html, text };
}

export function getResetPasswordEmailTemplate(options: {
  username: string;
  resetUrl: string;
}): { subject: string; html: string; text: string } {
  const { username, resetUrl } = options;
  
  const subject = 'Đặt lại mật khẩu SEOAIWriter của bạn';
  
  const html = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">SEOAIWriter</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
      <h2 style="color: #1e3a8a;">Đặt lại mật khẩu của bạn</h2>
      <p>Chào ${username},</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SEOAIWriter của bạn. Nhấp vào nút bên dưới để đặt mật khẩu mới:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Đặt lại mật khẩu</a>
      </div>
      <p>Hoặc bạn có thể copy và dán đường dẫn này vào trình duyệt của bạn:</p>
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
      <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ nếu bạn có bất kỳ câu hỏi nào.</p>
      <p>Trân trọng,<br>Đội ngũ SEOAIWriter</p>
    </div>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      <p>© ${new Date().getFullYear()} SEOAIWriter. Tất cả các quyền được bảo lưu.</p>
    </div>
  </div>
  `;
  
  const text = `
Đặt lại mật khẩu SEOAIWriter của bạn

Chào ${username},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SEOAIWriter của bạn. Vui lòng truy cập vào liên kết sau để đặt mật khẩu mới:

${resetUrl}

Liên kết này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ nếu bạn có bất kỳ câu hỏi nào.

Trân trọng,
Đội ngũ SEOAIWriter
  `;
  
  return { subject, html, text };
}

export function getWelcomeEmailTemplate(options: {
  username: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const { username, loginUrl } = options;
  
  const subject = 'Chào mừng bạn đến với SEOAIWriter!';
  
  const html = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">SEOAIWriter</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
      <h2 style="color: #1e3a8a;">Chào mừng bạn đến với SEOAIWriter!</h2>
      <p>Chào ${username},</p>
      <p>Chúng tôi rất vui mừng khi bạn đã tham gia cùng chúng tôi! Tài khoản của bạn đã được kích hoạt thành công và bạn đã sẵn sàng bắt đầu tạo nội dung tuyệt vời được tối ưu hóa cho SEO.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Đăng nhập ngay</a>
      </div>
      <h3 style="color: #1e3a8a;">Bắt đầu với SEOAIWriter</h3>
      <ul>
        <li>Tạo bài viết được tối ưu hóa SEO dựa trên các từ khóa mục tiêu của bạn</li>
        <li>Sử dụng AI để tạo nội dung đa ngôn ngữ</li>
        <li>Xuất bản trực tiếp lên WordPress hoặc mạng xã hội</li>
        <li>Theo dõi hiệu suất nội dung của bạn</li>
      </ul>
      <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với đội hỗ trợ của chúng tôi.</p>
      <p>Trân trọng,<br>Đội ngũ SEOAIWriter</p>
    </div>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      <p>© ${new Date().getFullYear()} SEOAIWriter. Tất cả các quyền được bảo lưu.</p>
    </div>
  </div>
  `;
  
  const text = `
Chào mừng bạn đến với SEOAIWriter!

Chào ${username},

Chúng tôi rất vui mừng khi bạn đã tham gia cùng chúng tôi! Tài khoản của bạn đã được kích hoạt thành công và bạn đã sẵn sàng bắt đầu tạo nội dung tuyệt vời được tối ưu hóa cho SEO.

Bạn có thể đăng nhập tại: ${loginUrl}

Bắt đầu với SEOAIWriter:
- Tạo bài viết được tối ưu hóa SEO dựa trên các từ khóa mục tiêu của bạn
- Sử dụng AI để tạo nội dung đa ngôn ngữ
- Xuất bản trực tiếp lên WordPress hoặc mạng xã hội
- Theo dõi hiệu suất nội dung của bạn

Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với đội hỗ trợ của chúng tôi.

Trân trọng,
Đội ngũ SEOAIWriter
  `;
  
  return { subject, html, text };
}