import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// MongoDB Connection Cache for serverless
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (retries = 3): Promise<typeof mongoose> => {
  // Return cached connection if available and connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  // Return existing connection promise if one is in progress
  if (connectionPromise) {
    return connectionPromise;
  }
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set. Please configure it in Vercel dashboard.');
  }

  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Set mongoose options for serverless environment
        mongoose.set('bufferCommands', false);
        mongoose.set('strictQuery', true);
        
        const conn = await mongoose.connect(mongoUri, {
          bufferCommands: false,
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 20000,
          connectTimeoutMS: 5000,
        });
        
        cachedConnection = conn;
        connectionPromise = null;
        console.log(`MongoDB connected successfully (attempt ${attempt})`);
        return conn;
      } catch (error) {
        console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);
        
        if (attempt === retries) {
          connectionPromise = null;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`MongoDB connection failed after ${retries} attempts: ${errorMessage}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000)));
      }
    }
    throw new Error('MongoDB connection failed');
  })();

  return connectionPromise;
};

// Admin Interface
interface IAdmin extends Document {
  email: string;
  password: string;
  name?: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
}

// Admin Schema for auth
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Use type assertion to fix TS2349
const Admin = (mongoose.models.AuthAdmin || mongoose.model<IAdmin>('AuthAdmin', adminSchema, 'admins')) as Model<IAdmin>;

const JWT_SECRET = process.env.JWT_SECRET || 'nebulytix-jwt-secret-change-in-production';
const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'nebulytix-setup-2024';

// Set CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-clerk-user-id');
};

// Handle Login
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  // Generate token
  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    },
  });
}

// Handle Setup (create first admin)
async function handleSetup(req: VercelRequest, res: VercelResponse) {
  try {
    const { email, password, name, setupKey } = req.body;

    // Validate setup key
    if (setupKey !== SETUP_KEY) {
      return res.status(403).json({
        success: false,
        message: `Invalid setup key. Expected: ${SETUP_KEY}`,
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if admin already exists with this email
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists. Please use Login instead.',
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
      isActive: true,
    });

    await admin.save();

    // Generate token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create admin',
    });
  }
}

// Handle Verify Token
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Route based on query parameter or path
    const action = req.query.action as string || 'login';

    switch (action) {
      case 'login':
        return handleLogin(req, res);
      case 'setup':
        return handleSetup(req, res);
      case 'verify':
        return handleVerify(req, res);
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
