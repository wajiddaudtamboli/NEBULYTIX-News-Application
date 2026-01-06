import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

const router: Router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nebulytix-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Admin Login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password || '');
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate token
    const token = generateToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'LOGIN_FAILED',
    });
  }
});

// Verify Clerk user and create/get user in our DB
router.post('/clerk/sync', async (req: Request, res: Response) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID and email are required',
        code: 'MISSING_FIELDS',
      });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({
        clerkId,
        email: email.toLowerCase(),
        name: name || '',
      });
      await user.save();
    } else {
      // Update user info
      user.email = email.toLowerCase();
      if (name) user.name = name;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
      },
      message: 'User synced successfully',
    });
  } catch (error) {
    console.error('Clerk sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
      code: 'SYNC_FAILED',
    });
  }
});

// Verify admin token
router.get('/admin/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found',
          code: 'ADMIN_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        message: 'Token valid',
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      code: 'VERIFICATION_FAILED',
    });
  }
});

// Create initial admin (only if no admins exist)
router.post('/admin/setup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, setupKey } = req.body;

    // Check setup key for security
    const validSetupKey = process.env.ADMIN_SETUP_KEY || 'nebulytix-setup-2024';
    
    if (setupKey !== validSetupKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid setup key',
        code: 'INVALID_SETUP_KEY',
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_FIELDS',
      });
    }

    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Use login instead.',
        code: 'ADMIN_EXISTS',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || 'Admin',
      role: 'superadmin',
      permissions: ['create', 'edit', 'delete', 'feature', 'trend', 'manage_admins'],
    });

    await admin.save();

    // Generate token
    const token = generateToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      message: 'Admin created successfully',
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      code: 'SETUP_FAILED',
    });
  }
});

export default router;
