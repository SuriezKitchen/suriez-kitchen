import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session: any;
    }
  }
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  isActive: boolean;
}

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 15 * 60 * 1000, // 15 minutes (900,000 ms)
    sameSite: "strict" as const, // CSRF protection
  },
  name: "chefvlog.sid", // Custom session name
};

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // High security
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Authentication middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
    return;
  }

  const now = Date.now();
  const lastActivity = req.session.lastActivity || req.session.loginTime || now;
  const timeSinceLastActivity = now - lastActivity;
  const sessionTimeout = 15 * 60 * 1000; // 15 minutes

  // Check if session has been inactive for too long
  if (timeSinceLastActivity > sessionTimeout) {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });
    res.status(401).json({
      message: "Session expired due to inactivity",
      code: "SESSION_EXPIRED",
    });
    return;
  }

  // Update last activity time and extend session
  req.session.lastActivity = now;
  req.session.expiresAt = now + sessionTimeout;

  next();
};

// Login function
export const login = async (
  req: Request,
  res: Response,
  username: string,
  password: string,
  user: any
): Promise<void> => {
  try {
    // Check if session is available
    if (!req.session) {
      console.error("Session not available in login function");
      res.status(500).json({
        message: "Session not initialized",
        code: "SESSION_NOT_INITIALIZED",
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        message: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
      return;
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.loginTime = Date.now();
    req.session.expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    req.session.lastActivity = Date.now();
    req.session.userAgent = req.get("User-Agent");
    req.session.ipAddress = req.ip || req.connection.remoteAddress;

    // Save session
    req.session.save((err: any) => {
      if (err) {
        console.error("Session save error:", err);
        console.error("Session save error stack:", err.stack);
        if (!res.headersSent) {
          res.status(500).json({
            message: "Failed to create session",
            code: "SESSION_ERROR",
          });
        }
        return;
      }

      if (!res.headersSent) {
        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Login error stack:", error instanceof Error ? error.stack : "No stack trace");
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
};

// Logout function
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error("Logout error:", err);
      res.status(500).json({
        message: "Failed to logout",
        code: "LOGOUT_ERROR",
      });
      return;
    }

    res.clearCookie("chefvlog.sid");
    res.json({
      message: "Logout successful",
    });
  });
};

// Get current user
export const getCurrentUser = (req: Request): AuthUser | null => {
  if (!req.session || !req.session.userId) {
    return null;
  }

  return {
    id: req.session.userId,
    username: req.session.username,
    email: req.session.email,
    isActive: true, // Session exists means user is active
  };
};

// Security utilities
export const generateSecureToken = (): string => {
  return randomBytes(32).toString("hex");
};

export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset counter after 15 minutes
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }

  // Allow max 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    return false;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return true;
};
