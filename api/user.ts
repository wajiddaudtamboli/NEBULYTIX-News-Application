import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Model, Document, Types } from 'mongoose';

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

// User Interface
interface IUser extends Document {
  clerkId: string;
  email: string;
  name?: string;
  savedArticles: Types.ObjectId[];
}

// User Schema
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],
}, { timestamps: true });

// News Schema (needed for populate)
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String },
  category: { type: String, required: true },
  source: { type: String, required: true },
  coverImage: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

// Use type assertion to fix TS2349
const User = (mongoose.models.User || mongoose.model<IUser>('User', userSchema)) as Model<IUser>;
const News = mongoose.models.News || mongoose.model('News', newsSchema);
void News; // Prevent unused variable warning

// Set CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-clerk-user-id');
};

// Sync user from Clerk
async function handleSync(req: VercelRequest, res: VercelResponse) {
  const { clerkId, email, name } = req.body;

  if (!clerkId || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  let user = await User.findOne({ clerkId });

  if (!user) {
    user = new User({ clerkId, email, name });
    await user.save();
  } else {
    if (email) user.email = email;
    if (name) user.name = name;
    await user.save();
  }

  return res.status(200).json({ success: true, data: user });
}

// Get user profile
async function handleProfile(req: VercelRequest, res: VercelResponse) {
  const clerkId = req.headers['x-clerk-user-id'] as string;

  if (!clerkId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = await User.findOne({ clerkId }).populate('savedArticles').lean();

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.status(200).json({ success: true, data: user });
}

// Get saved articles
async function handleSaved(req: VercelRequest, res: VercelResponse) {
  const clerkId = req.headers['x-clerk-user-id'] as string;

  if (!clerkId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = await User.findOne({ clerkId }).populate('savedArticles');

  if (!user) {
    return res.status(200).json({ success: true, data: [] });
  }

  return res.status(200).json({ success: true, data: user.savedArticles || [] });
}

// Save/unsave article
async function handleSaveToggle(req: VercelRequest, res: VercelResponse, newsId: string) {
  const clerkId = req.headers['x-clerk-user-id'] as string;

  if (!clerkId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!newsId) {
    return res.status(400).json({ success: false, error: 'News ID is required' });
  }

  const user = await User.findOne({ clerkId });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const newsObjectId = new Types.ObjectId(newsId);
  const isSaved = user.savedArticles.some((id: Types.ObjectId) => id.equals(newsObjectId));

  if (isSaved) {
    user.savedArticles = user.savedArticles.filter((id: Types.ObjectId) => !id.equals(newsObjectId));
  } else {
    user.savedArticles.push(newsObjectId);
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: isSaved ? 'Article removed from saved' : 'Article saved',
    data: { isSaved: !isSaved },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const action = req.query.action as string;
    const newsId = req.query.newsId as string;

    // Route based on action
    switch (action) {
      case 'sync':
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        return handleSync(req, res);
      
      case 'profile':
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
        return handleProfile(req, res);
      
      case 'saved':
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
        return handleSaved(req, res);
      
      case 'save':
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        return handleSaveToggle(req, res, newsId);
      
      default:
        // Default to saved if GET, sync if POST
        if (req.method === 'GET') {
          return handleSaved(req, res);
        } else if (req.method === 'POST' && req.body.clerkId) {
          return handleSync(req, res);
        }
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
