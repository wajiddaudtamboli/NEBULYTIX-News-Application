import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

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

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-clerk-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { newsId } = req.query;

  if (!newsId || typeof newsId !== 'string') {
    return res.status(400).json({ error: 'News ID is required' });
  }

  try {
    await connectDB();

    const clerkId = req.headers['x-clerk-user-id'] as string;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const newsObjectId = new mongoose.Types.ObjectId(newsId);
    const isSaved = user.savedArticles.some((id: mongoose.Types.ObjectId) => id.equals(newsObjectId));

    if (isSaved) {
      user.savedArticles = user.savedArticles.filter((id: mongoose.Types.ObjectId) => !id.equals(newsObjectId));
    } else {
      user.savedArticles.push(newsObjectId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isSaved ? 'Article removed from saved' : 'Article saved',
      data: { isSaved: !isSaved },
    });
  } catch (error) {
    console.error('Save article error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save article',
    });
  }
}
