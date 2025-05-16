import { randomBytes } from "crypto";
import { storage } from "./storage";
import { sendEmail, appConfig } from "./email-service";
import { getVerificationEmailTemplate, getResetPasswordEmailTemplate, getWelcomeEmailTemplate } from "./email-templates";
import { InsertUser, User } from "@shared/schema";

/**
 * Tạo token ngẫu nhiên
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Đăng ký người dùng mới với xác thực email
 */
export async function registerUser(userData: InsertUser): Promise<{ 
  success: boolean; 
  user?: User; 
  error?: string; 
}> {
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await storage.getUserByUsername(userData.email);
    if (existingUser) {
      return { 
        success: false, 
        error: "Email đã tồn tại trong hệ thống" 
      };
    }

    // Tạo token xác thực
    const verificationToken = generateToken();
    const now = new Date();
    const tokenExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Hiệu lực 24 giờ

    // Tạo người dùng mới với token xác thực
    const user = await storage.createUser({
      ...userData,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
      isVerified: false
    });

    // Lấy ID của gói dùng thử từ system settings
    const trialPlanIdSetting = await storage.getSetting('trial_plan_id');
    if (trialPlanIdSetting) {
      const trialPlanId = parseInt(trialPlanIdSetting);
      
      // Kiểm tra gói dùng thử tồn tại
      const trialPlan = await storage.getPlan(trialPlanId);
      if (trialPlan) {
        // Gán gói dùng thử cho người dùng
        const now = new Date();
        const endDate = trialPlan.duration 
          ? new Date(now.getTime() + trialPlan.duration * 24 * 60 * 60 * 1000)
          : null;
          
        await storage.createUserPlan({
          userId: user.id,
          planId: trialPlanId,
          startDate: now,
          endDate: endDate || undefined,
          isActive: true
        });
        
        // Cộng credit từ gói dùng thử
        if (trialPlan.value > 0) {
          await storage.addUserCredits(
            user.id, 
            Number(trialPlan.value), 
            trialPlanId,
            `Credits từ gói dùng thử`
          );
        }
      }
    }

    // Gửi email xác thực
    const verificationUrl = `${appConfig.baseUrl}/api/verify-email?token=${verificationToken}`;
    const emailTemplate = getVerificationEmailTemplate({
      username: user.username,
      verificationUrl
    });

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi đăng ký người dùng'
    };
  }
}

/**
 * Xác thực email người dùng bằng token
 */
export async function verifyEmail(token: string): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    if (!token) {
      return {
        success: false,
        error: "Token xác thực không hợp lệ"
      };
    }

    // Tìm người dùng bằng token
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return {
        success: false,
        error: "Token xác thực không hợp lệ hoặc đã hết hạn"
      };
    }

    // Kiểm tra token còn hiệu lực không
    if (!user.verificationTokenExpiry || new Date() > new Date(user.verificationTokenExpiry)) {
      return {
        success: false,
        error: "Token xác thực đã hết hạn"
      };
    }

    // Cập nhật trạng thái xác thực của người dùng
    const updatedUser = await storage.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });

    if (!updatedUser) {
      return {
        success: false,
        error: "Không thể cập nhật trạng thái xác thực"
      };
    }

    // Gửi email chào mừng
    const loginUrl = `${appConfig.baseUrl}/auth`;
    const emailTemplate = getWelcomeEmailTemplate({
      username: updatedUser.username,
      loginUrl
    });

    await sendEmail({
      to: updatedUser.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    return {
      success: true,
      user: updatedUser
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi xác thực email'
    };
  }
}

/**
 * Yêu cầu đặt lại mật khẩu
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Tìm người dùng bằng email
    const user = await storage.getUserByUsername(email);
    
    if (!user) {
      // Không tiết lộ thông tin tài khoản tồn tại hay không
      return {
        success: true
      };
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = generateToken();
    const now = new Date();
    const tokenExpiry = new Date(now.getTime() + 1 * 60 * 60 * 1000); // Hiệu lực 1 giờ

    // Cập nhật token đặt lại mật khẩu
    await storage.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: tokenExpiry
    });

    // Gửi email đặt lại mật khẩu
    const resetUrl = `${appConfig.baseUrl}/reset-password?token=${resetToken}`;
    const emailTemplate = getResetPasswordEmailTemplate({
      username: user.username,
      resetUrl
    });

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi yêu cầu đặt lại mật khẩu'
    };
  }
}

/**
 * Đặt lại mật khẩu
 */
export async function resetPassword(token: string, newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!token || !newPassword) {
      return {
        success: false,
        error: "Token đặt lại mật khẩu hoặc mật khẩu mới không hợp lệ"
      };
    }

    // Tìm người dùng bằng token
    const user = await storage.getUserByResetPasswordToken(token);
    
    if (!user) {
      return {
        success: false,
        error: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
      };
    }

    // Kiểm tra token còn hiệu lực không
    if (!user.resetPasswordTokenExpiry || new Date() > new Date(user.resetPasswordTokenExpiry)) {
      return {
        success: false,
        error: "Token đặt lại mật khẩu đã hết hạn"
      };
    }

    // Hash mật khẩu mới và cập nhật
    // Note: Password hashing should be done in storage.updateUser
    await storage.updateUserPassword(user.id, newPassword);

    // Xóa token đặt lại mật khẩu
    await storage.updateUser(user.id, {
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi đặt lại mật khẩu'
    };
  }
}