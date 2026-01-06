import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkId: string;
        email: string;
      };
      admin?: {
        clerkId: string;
        role: string;
      };
    }
  }
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const clerkId = req.headers['x-clerk-id'] as string;
  const email = req.headers['x-user-email'] as string;

  if (!clerkId || !email) {
    return res.status(401).json({ error: 'Unauthorized: Missing user info' });
  }

  req.user = { clerkId, email };
  next();
};

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const clerkId = req.headers['x-clerk-id'] as string;
  const role = req.headers['x-admin-role'] as string;

  if (!clerkId || !role) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required' });
  }

  if (!['admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  req.admin = { clerkId, role };
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const clerkId = req.headers['x-clerk-id'] as string;
  const email = req.headers['x-user-email'] as string;

  if (clerkId && email) {
    req.user = { clerkId, email };
  }

  next();
};
