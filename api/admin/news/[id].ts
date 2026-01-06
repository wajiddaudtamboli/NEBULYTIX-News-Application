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

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String },
  category: {
    type: String,
    enum: ['Technology', 'Business', 'Science', 'World', 'Health'],
    required: true
  },
  source: { type: String, required: true },
  coverImage: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

const News = mongoose.models.News || mongoose.model('News', newsSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-clerk-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'News ID is required' });
  }

  try {
    await connectDB();

    // PUT - Update news
    if (req.method === 'PUT') {
      const updates = req.body;

      if (updates.category) {
        const validCategories = ['Technology', 'Business', 'Science', 'World', 'Health'];
        if (!validCategories.includes(updates.category)) {
          return res.status(400).json({ error: 'Invalid category' });
        }
      }

      const news = await News.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!news) {
        return res.status(404).json({ success: false, error: 'News not found' });
      }

      return res.status(200).json({ success: true, data: news });
    }

    // DELETE - Delete news
    if (req.method === 'DELETE') {
      const news = await News.findByIdAndDelete(id);

      if (!news) {
        return res.status(404).json({ success: false, error: 'News not found' });
      }

      return res.status(200).json({ success: true, message: 'News deleted successfully' });
    }

    // PATCH - Toggle featured/trending
    if (req.method === 'PATCH') {
      const { action } = req.query;
      
      const news = await News.findById(id);
      if (!news) {
        return res.status(404).json({ success: false, error: 'News not found' });
      }

      if (action === 'featured') {
        news.isFeatured = !news.isFeatured;
      } else if (action === 'trending') {
        news.isTrending = !news.isTrending;
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

      await news.save();
      return res.status(200).json({ success: true, data: news });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin news operation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
