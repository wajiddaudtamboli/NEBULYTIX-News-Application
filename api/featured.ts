import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Model, Document } from 'mongoose';

// MongoDB Connection Cache for serverless
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (retries = 2): Promise<typeof mongoose> => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  if (connectionPromise) {
    return connectionPromise;
  }
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set');
  
  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        mongoose.set('bufferCommands', false);
        mongoose.set('strictQuery', true);
        
        const conn = await mongoose.connect(mongoUri, {
          bufferCommands: false,
          maxPoolSize: 3,
          serverSelectionTimeoutMS: 4000,
          socketTimeoutMS: 15000,
          connectTimeoutMS: 4000,
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
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
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
  category: string;
  source: string;
  coverImage: string;
  publishedAt: Date;
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
  tags: string[];
}

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
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
const News = (mongoose.models.News || mongoose.model<INews>('News', newsSchema)) as Model<INews>;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    const featured = await News.find({ isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean();
    res.status(200).json({ success: true, data: featured });
  } catch (error) {
    console.error('Featured API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
