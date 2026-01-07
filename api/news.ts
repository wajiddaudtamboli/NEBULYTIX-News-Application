import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Model, Document } from 'mongoose';

// MongoDB Connection Cache for serverless
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (retries = 3): Promise<typeof mongoose> => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  if (connectionPromise) {
    return connectionPromise;
  }
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        mongoose.set('bufferCommands', false);
        mongoose.set('strictQuery', true);
        
        const conn = await mongoose.connect(mongoUri, {
          bufferCommands: false,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        
        cachedConnection = conn;
        connectionPromise = null;
        return conn;
      } catch (error) {
        console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);
        
        if (attempt === retries) {
          connectionPromise = null;
          throw new Error(`MongoDB connection failed after ${retries} attempts`);
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000)));
      }
    }
    throw new Error('MongoDB connection failed');
  })();

  return connectionPromise;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const { id, category, date, page = '1', limit = '12' } = req.query;

    // If ID is provided, return single news item with view increment
    if (id && typeof id === 'string') {
      const news = await News.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      ).lean();

      if (!news) {
        return res.status(404).json({ success: false, error: 'News not found' });
      }

      return res.status(200).json({ success: true, data: news });
    }

    // Otherwise list all news with pagination
    const query: Record<string, unknown> = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (date) {
      const dateObj = new Date(date as string);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      query.publishedAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      News.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    });
  }
}
