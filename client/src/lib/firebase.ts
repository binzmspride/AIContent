import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signOut,
  getRedirectResult
} from "firebase/auth";
import { apiRequest } from "./queryClient";

// Firebase cấu hình sẽ được tải từ server
let firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
} | null = null;

let firebaseApp: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;
let facebookProvider: FacebookAuthProvider | null = null;
let isInitialized = false;

/**
 * Khởi tạo Firebase với cấu hình từ server
 */
export async function initializeFirebase() {
  if (isInitialized) return { auth, googleProvider, facebookProvider };

  try {
    // Tải cấu hình Firebase từ server
    const response = await fetch('/api/firebase/config');
    if (!response.ok) {
      // Silently fail if Firebase config endpoint doesn't exist
      isInitialized = true;
      return { auth: null, googleProvider: null, facebookProvider: null };
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      // Silently fail if no Firebase config is available
      isInitialized = true;
      return { auth: null, googleProvider: null, facebookProvider: null };
    }

    const { firebaseApiKey, firebaseProjectId, firebaseAppId, enableGoogleAuth, enableFacebookAuth } = data.data;

    // Kiểm tra xem cấu hình có đầy đủ không
    if (!firebaseApiKey || !firebaseProjectId || !firebaseAppId) {
      // Silently fail if Firebase configuration is incomplete
      isInitialized = true;
      return { auth: null, googleProvider: null, facebookProvider: null };
    }

    // Tạo cấu hình Firebase
    firebaseConfig = {
      apiKey: firebaseApiKey,
      authDomain: `${firebaseProjectId}.firebaseapp.com`,
      projectId: firebaseProjectId,
      appId: firebaseAppId,
    };

    // Khởi tạo Firebase
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);

    // Khởi tạo các provider nếu được bật
    if (enableGoogleAuth) {
      googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
    }

    if (enableFacebookAuth) {
      facebookProvider = new FacebookAuthProvider();
      facebookProvider.addScope('email');
      facebookProvider.addScope('public_profile');
    }

    isInitialized = true;
    
    return { auth, googleProvider, facebookProvider };
  } catch (error) {
    // Silently fail and mark as initialized to prevent retries
    isInitialized = true;
    return { auth: null, googleProvider: null, facebookProvider: null };
  }
}

/**
 * Đăng nhập với Google
 */
export async function signInWithGoogle() {
  const { auth, googleProvider } = await initializeFirebase();
  
  if (!auth || !googleProvider) {
    throw new Error('Google authentication is not configured');
  }

  try {
    // Sử dụng popup để đăng nhập
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;

    // Gửi token ID lên server để xác thực
    return await authenticateWithServer(user);
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Đăng nhập với Facebook
 */
export async function signInWithFacebook() {
  const { auth, facebookProvider } = await initializeFirebase();
  
  if (!auth || !facebookProvider) {
    throw new Error('Facebook authentication is not configured');
  }

  try {
    // Sử dụng popup để đăng nhập
    const result = await signInWithPopup(auth, facebookProvider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const user = result.user;

    // Gửi token ID lên server để xác thực
    return await authenticateWithServer(user);
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
}

/**
 * Xử lý chuyển hướng sau khi đăng nhập
 */
export async function handleAuthRedirect() {
  const { auth } = await initializeFirebase();
  
  if (!auth) {
    return null;
  }

  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      // Xác thực với server
      return await authenticateWithServer(user);
    }
    return null;
  } catch (error) {
    console.error('Auth redirect error:', error);
    throw error;
  }
}

/**
 * Xác thực với server sau khi đăng nhập qua Firebase
 */
async function authenticateWithServer(user: any) {
  if (!user) {
    throw new Error('No user data available');
  }

  try {
    // Lấy token ID từ user
    const idToken = await user.getIdToken();
    
    // Gửi token ID lên server để xác thực
    const res = await apiRequest('POST', '/api/auth/firebase', {
      idToken,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });

    if (!res.ok) {
      throw new Error('Server authentication failed');
    }

    return await res.json();
  } catch (error) {
    console.error('Server authentication error:', error);
    throw error;
  }
}

/**
 * Đăng xuất
 */
export async function logoutFirebase() {
  const { auth } = await initializeFirebase();
  
  if (auth) {
    return signOut(auth);
  }
}