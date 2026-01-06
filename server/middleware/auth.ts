import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nebulytix-jwt-secret-change-in-production';

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkId: string;
        email: string;
        id?: string;
      };
      admin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Authenticate user via Clerk headers
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const clerkId = req.headers['x-clerk-user-id'] as string;
  const email = req.headers['x-user-email'] as string;

  if (!clerkId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }

  req.user = { clerkId, email: email || '' };
  next();
};

// Authenticate admin via JWT token
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      
      // Verify admin still exists and is active
      const admin = await Admin.findById(decoded.id);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or inactive',
          code: 'ADMIN_INVALID',
        });
      }

      req.admin = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

// Check if user has specific permission
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    try {
      const admin = await Admin.findById(req.admin.id);
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found',
          code: 'ADMIN_NOT_FOUND',
        });
      }

      // Superadmins have all permissions
      if (admin.role === 'superadmin' || admin.permissions.includes(permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
        code: 'FORBIDDEN',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        code: 'PERMISSION_ERROR',
      });
    }
  };
};

// Optional authentication (doesn't fail if no auth)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const clerkId = req.headers['x-clerk-user-id'] as string;
  const email = req.headers['x-user-email'] as string;

  if (clerkId) {
    req.user = { clerkId, email: email || '' };
  }

  next();
};

// Sanitize MongoDB query inputs
export const sanitizeQuery = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith('$')) {
      continue;
    }
    sanitized[key] = sanitizeQuery(obj[key]);
  }

  return sanitized;
};
