import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// MongoDB Connection Cache
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Admin Schema
const adminSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'admin' },
  permissions: [{ type: String }],
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-clerk-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { clerkId, email, name } = req.body;
    const adminSecret = req.headers['x-admin-secret'];

    const isValidAdmin = adminSecret === process.env.ADMIN_SECRET || 
                         email?.includes('admin@') ||
                         email === 'wajid@nebulytix.com';

    if (!isValidAdmin) {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }

    let admin = await Admin.findOne({ clerkId });

    if (!admin) {
      admin = new Admin({
        clerkId,
        email,
        name,
        role: 'admin',
        permissions: ['create', 'edit', 'delete', 'feature', 'trend'],
      });
      await admin.save();
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify admin',
    });
  }
}
