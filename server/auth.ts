import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import * as schema from "@shared/schema";

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
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid username or password' });
        } else {
          return done(null, user);
        }
      } catch (error) {
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
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "Username already exists" 
        });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
      });

      // Give new users 5 free credits
      await storage.addUserCredits(user.id, 5, undefined, 'Welcome bonus');

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ 
          success: true, 
          data: userWithoutPassword 
        });
      });
    } catch (error) {
      next(error);
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
