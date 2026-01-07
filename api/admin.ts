import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Model, Document } from 'mongoose';

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

// News Interface
interface INews extends Document {
  title: string;
  summary: string;
  content?: string;
  category: string;
  source: string;
  coverImage: string;
  publishedAt: Date;
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
  tags: string[];
}

// News Schema
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

// Use type assertion to fix TS2349
const News = (mongoose.models.News || mongoose.model<INews>('News', newsSchema)) as Model<INews>;

// Set CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret, x-clerk-user-id, x-admin-role');
};

// GET - List all news with pagination
async function handleList(req: VercelRequest, res: VercelResponse) {
  const { category, page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 50;
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, string> = {};
  if (category && category !== 'All' && category !== 'all') {
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
async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const { title, summary, content, category, source, coverImage, isFeatured, isTrending, tags } = req.body;

  if (!title || !summary || !category || !coverImage) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const news = new News({
    title,
    summary,
    content,
    category,
    source: source || 'Nebulytix',
    coverImage,
    isFeatured: !!isFeatured,
    isTrending: !!isTrending,
    tags: tags || [],
    publishedAt: new Date(),
  });

  await news.save();

  return res.status(201).json({
    success: true,
    message: 'News created successfully',
    data: news,
  });
}

// GET by ID - Get single news
async function handleGetById(res: VercelResponse, id: string) {
  const news = await News.findById(id).lean();
  
  if (!news) {
    return res.status(404).json({ success: false, error: 'News not found' });
  }

  return res.status(200).json({ success: true, data: news });
}

// PUT - Update news
async function handleUpdate(req: VercelRequest, res: VercelResponse, id: string) {
  const updates = req.body;

  if (updates.category) {
    const validCategories = ['Technology', 'Business', 'Science', 'World', 'Health'];
    if (!validCategories.includes(updates.category)) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
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
async function handleDelete(res: VercelResponse, id: string) {
  const news = await News.findByIdAndDelete(id);

  if (!news) {
    return res.status(404).json({ success: false, error: 'News not found' });
  }

  return res.status(200).json({ success: true, message: 'News deleted successfully' });
}

// PATCH - Toggle featured/trending
async function handleToggle(res: VercelResponse, id: string, action: string) {
  const news = await News.findById(id);
  if (!news) {
    return res.status(404).json({ success: false, error: 'News not found' });
  }

  if (action === 'featured') {
    news.isFeatured = !news.isFeatured;
    await news.save();
    return res.status(200).json({ 
      success: true, 
      data: news,
      message: news.isFeatured ? 'Marked as featured' : 'Removed from featured'
    });
  } else if (action === 'trending') {
    news.isTrending = !news.isTrending;
    await news.save();
    return res.status(200).json({ 
      success: true, 
      data: news,
      message: news.isTrending ? 'Marked as trending' : 'Removed from trending'
    });
  } else {
    return res.status(400).json({ error: 'Invalid action. Use ?action=featured or ?action=trending' });
  }
}

// GET - Admin stats
async function handleStats(res: VercelResponse) {
  const [totalNews, featuredCount, trendingCount, categoryStats] = await Promise.all([
    News.countDocuments(),
    News.countDocuments({ isFeatured: true }),
    News.countDocuments({ isTrending: true }),
    News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ])
  ]);

  return res.status(200).json({
    success: true,
    data: {
      totalNews,
      featuredCount,
      trendingCount,
      categoryStats
    }
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const id = req.query.id as string;
    const action = req.query.action as string;

    // Stats endpoint
    if (action === 'stats') {
      return handleStats(res);
    }

    // Routes by method
    switch (req.method) {
      case 'GET':
        if (id) {
          return handleGetById(res, id);
        }
        return handleList(req, res);

      case 'POST':
        return handleCreate(req, res);

      case 'PUT':
        if (!id) return res.status(400).json({ error: 'News ID required' });
        return handleUpdate(req, res, id);

      case 'DELETE':
        if (!id) return res.status(400).json({ error: 'News ID required' });
        return handleDelete(res, id);

      case 'PATCH':
        if (!id) return res.status(400).json({ error: 'News ID required' });
        return handleToggle(res, id, action);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin news error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
