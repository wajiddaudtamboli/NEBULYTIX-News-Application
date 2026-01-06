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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-clerk-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    // GET - List all news for admin
    if (req.method === 'GET') {
      const { category, page = '1', limit = '50' } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, string> = {};
      if (category && category !== 'All') {
        filter.category = category as string;
      }

      const [news, total] = await Promise.all([
        News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        News.countDocuments(filter)
      ]);

      return res.status(200).json({
        success: true,
        data: news,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    }

    // POST - Create news
    if (req.method === 'POST') {
      const { title, summary, category, source, coverImage, isFeatured, isTrending, tags } = req.body;

      if (!title || !summary || !category || !coverImage) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const news = new News({
        title,
        summary,
        category,
        source: source || 'Nebulytix',
        coverImage,
        isFeatured: !!isFeatured,
        isTrending: !!isTrending,
        tags: tags || [],
        publishedAt: new Date(),
      });

      await news.save();
      return res.status(201).json({ success: true, data: news });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin news error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
