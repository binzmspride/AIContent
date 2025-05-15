import { storage } from "./storage";
import { Request, Response, NextFunction } from "express";

/**
 * Lấy cấu hình Firebase từ hệ thống
 * @returns Cấu hình Firebase hoặc null nếu không thể lấy được
 */
export async function getFirebaseConfig() {
  try {
    const firebaseSettings = await storage.getSettingsByCategory('firebase');
    
    const enableGoogleAuth = firebaseSettings.enableGoogleAuth === 'true';
    const enableFacebookAuth = firebaseSettings.enableFacebookAuth === 'true';
    
    if (!firebaseSettings.firebaseApiKey || !firebaseSettings.firebaseProjectId || !firebaseSettings.firebaseAppId) {
      console.log('Firebase configuration is incomplete');
      return null;
    }
    
    return {
      firebaseApiKey: firebaseSettings.firebaseApiKey,
      firebaseProjectId: firebaseSettings.firebaseProjectId,
      firebaseAppId: firebaseSettings.firebaseAppId,
      enableGoogleAuth,
      enableFacebookAuth
    };
  } catch (error) {
    console.error('Error getting Firebase configuration:', error);
    return null;
  }
}

/**
 * Xác thực một ID token từ Firebase
 * Trong môi trường thực, bạn sẽ sử dụng Firebase Admin SDK để xác thực token
 * Tuy nhiên, để đơn giản hóa mã nguồn, chúng ta chỉ xác minh định dạng cơ bản
 * và tin tưởng token ID từ client.
 * 
 * @param idToken Token ID từ Firebase Auth
 * @param userInfo Thông tin người dùng từ client
 * @returns Thông tin người dùng đã xác thực hoặc null nếu có lỗi
 */
export async function verifyFirebaseToken(idToken: string, userInfo: any) {
  try {
    if (!idToken || idToken.length < 50) {
      console.error('Invalid token format');
      return null;
    }
    
    // Kiểm tra xem có cấu hình Firebase hay không
    const config = await getFirebaseConfig();
    if (!config) {
      console.error('Firebase is not configured');
      return null;
    }
    
    // Trong sản phẩm thực, bạn sẽ xác thực token với Firebase Admin SDK:
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const uid = decodedToken.uid;
    
    // Đơn giản hóa: Chúng ta tin tưởng thông tin người dùng từ client
    return {
      firebaseId: userInfo.firebaseId || "firebase_" + Date.now(), // ID ngẫu nhiên
      email: userInfo.email,
      displayName: userInfo.displayName || userInfo.email.split('@')[0],
      photoURL: userInfo.photoURL
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

/**
 * Tìm người dùng bằng email hoặc ID Firebase
 * @param email Email của người dùng
 * @param firebaseId ID Firebase của người dùng
 * @returns Người dùng hoặc null nếu không tìm thấy
 */
export async function findUserByFirebaseAuth(email: string, firebaseId: string) {
  try {
    // Tìm tất cả người dùng
    const allUsers = await storage.listUsers(1, 1000);
    
    // Lọc theo email
    const userByEmail = allUsers.users.find(user => user.email === email);
    if (userByEmail) {
      return userByEmail;
    }
    
    // Tìm người dùng bằng ID Firebase
    // Trong sản phẩm thực, bạn sẽ lưu trữ ID Firebase trong cơ sở dữ liệu
    // và tìm người dùng bằng ID đó
    
    return null;
  } catch (error) {
    console.error('Error finding user by Firebase auth:', error);
    return null;
  }
}

/**
 * Tạo người dùng mới từ thông tin xác thực Firebase
 * @param authInfo Thông tin xác thực từ Firebase
 * @returns Người dùng mới đã tạo hoặc null nếu có lỗi
 */
export async function createUserFromFirebase(authInfo: any) {
  try {
    // Tạo tên người dùng từ email (loại bỏ các ký tự không hợp lệ)
    const username = authInfo.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    
    // Tạo mật khẩu ngẫu nhiên (người dùng sẽ đăng nhập bằng Firebase nên không cần dùng)
    const randomPassword = Math.random().toString(36).slice(-10);
    
    // Tạo người dùng mới
    const newUser = await storage.createUser({
      username: username,
      email: authInfo.email,
      password: randomPassword, // Mật khẩu ngẫu nhiên
      fullName: authInfo.displayName || username,
      role: 'user',
      credits: 0,
      language: 'vi'
    });
    
    if (!newUser) {
      console.error('Failed to create user from Firebase auth');
      return null;
    }
    
    // Gán gói dùng thử mặc định cho người dùng mới
    await assignTrialPlan(newUser.id);
    
    return newUser;
  } catch (error) {
    console.error('Error creating user from Firebase auth:', error);
    return null;
  }
}

/**
 * Gán gói dùng thử cho người dùng mới
 * @param userId ID của người dùng
 */
async function assignTrialPlan(userId: number) {
  try {
    // Lấy ID gói dùng thử từ cài đặt hệ thống
    const trialPlanIdSetting = await storage.getSetting('trial_plan_id');
    if (!trialPlanIdSetting) {
      console.log('No trial plan configured');
      return;
    }
    
    const trialPlanId = parseInt(trialPlanIdSetting);
    const plan = await storage.getPlan(trialPlanId);
    
    if (!plan) {
      console.log('Trial plan not found');
      return;
    }
    
    // Tính ngày hết hạn (thường là 30 ngày)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (plan.duration || 30));
    
    // Tạo gói dùng thử cho người dùng
    await storage.createUserPlan({
      userId,
      planId: trialPlanId,
      startDate,
      endDate,
      isActive: true,
      usedStorage: 0
    });
    
    // Thêm credits cho người dùng mới
    await storage.addUserCredits(
      userId, 
      plan.value || 100, 
      trialPlanId, 
      `Trial plan (${plan.name})`
    );
    
    console.log(`Trial plan (${plan.name}) assigned to user ${userId}`);
  } catch (error) {
    console.error('Error assigning trial plan:', error);
  }
}