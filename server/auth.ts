import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import * as schema from "@shared/schema";
import { registerUser, verifyEmail, requestPasswordReset, resetPassword } from "./user-service";

declare global {
  namespace Express {
    interface User extends schema.User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'seo-ai-writer-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
        }
        
        // Tạm thời bỏ qua kiểm tra xác thực email
        // if (user.role !== 'admin' && !user.isVerified) {
        //   console.log(`User not verified: ${user.username}`);
        //   return done(null, false, { message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.' });
        // }
        
        console.log(`User found: ${user.username}, checking password...`);
        
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          console.log(`Password mismatch for user: ${user.username}`);
          return done(null, false, { message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
        }
        
        console.log(`Login successful for user: ${user.username}, role: ${user.role}`);
        return done(null, user);
      } catch (error) {
        console.error('Error during authentication:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Kiểm tra email đã tồn tại chưa
      const existingUserByEmail = await storage.getUserByUsername(email);
      if (existingUserByEmail) {
        return res.status(400).json({ 
          success: false, 
          error: "Email đã được sử dụng" 
        });
      }
      
      // Kiểm tra username đã tồn tại chưa (nếu khác email)
      if (username !== email) {
        const existingUserByUsername = await storage.getUserByUsername(username);
        if (existingUserByUsername) {
          return res.status(400).json({ 
            success: false, 
            error: "Username đã tồn tại" 
          });
        }
      }

      // Đăng ký người dùng mới với xác thực email
      const result = await registerUser({
        username,
        email,
        password: await hashPassword(password),
        fullName,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || "Lỗi khi đăng ký người dùng"
        });
      }

      // Tự động gán gói free cho người dùng mới
      if (result.user) {
        // Tìm gói free (type = 'free') 
        const freePlans = await storage.getPlans();
        const freePlan = freePlans.find(plan => plan.type === 'free');
        
        if (freePlan) {
          // Gán gói free cho user mới
          await storage.assignPlanToUser(result.user.id, freePlan.id);
          // Thêm credits từ gói free
          await storage.addUserCredits(result.user.id, freePlan.credits, freePlan.id, 'Gói miễn phí khi đăng ký');
        } else {
          // Fallback nếu không tìm thấy gói free
          await storage.addUserCredits(result.user.id, 10, undefined, 'Welcome bonus');
        }
      }

      // Trả về thành công nhưng không đăng nhập tự động
      // Người dùng cần xác thực email trước
      // Tự động xác thực tài khoản ngay khi đăng ký thành công (tính năng tạm thời)
      if (result.user) {
        await storage.updateUser(result.user.id, {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        });
        
        // Đăng nhập người dùng ngay sau khi đăng ký
        req.login(result.user, (err) => {
          if (err) return next(err);
          return res.status(201).json({
            success: true,
            message: "Đăng ký thành công. Bạn đã được đăng nhập tự động.",
            data: result.user
          });
        });
      } else {
        return res.status(201).json({
          success: true,
          message: "Đăng ký thành công."
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });
  
  // API xác thực email
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Token xác thực không hợp lệ"
        });
      }
      
      const result = await verifyEmail(token);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || "Không thể xác thực email"
        });
      }
      
      // Chuyển hướng đến trang đăng nhập với thông báo xác thực thành công
      return res.redirect('/auth?verified=true');
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi server khi xác thực email"
      });
    }
  });
  
  // Yêu cầu đặt lại mật khẩu
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email là bắt buộc"
        });
      }
      
      const result = await requestPasswordReset(email);
      
      // Luôn trả về thành công để tránh rò rỉ thông tin
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến email của bạn."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi server khi xử lý yêu cầu đặt lại mật khẩu"
      });
    }
  });
  
  // Đặt lại mật khẩu
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Token và mật khẩu mới là bắt buộc"
        });
      }
      
      const result = await resetPassword(token, newPassword);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || "Không thể đặt lại mật khẩu"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Mật khẩu đã được đặt lại thành công"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi server khi đặt lại mật khẩu"
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: schema.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: info?.message || 'Invalid username or password' 
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({ 
          success: true, 
          data: userWithoutPassword 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ success: true });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }
    
    // Don't include password in response
    const { password, ...userWithoutPassword } = req.user;
    res.json({ 
      success: true, 
      data: userWithoutPassword 
    });
  });
  
  // Middleware to check if user is authenticated
  app.use('/api/dashboard', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    next();
  });

  // Middleware to check if user is admin
  app.use('/api/admin', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    next();
  });
}
