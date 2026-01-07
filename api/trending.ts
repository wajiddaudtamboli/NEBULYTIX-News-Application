import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Model, Document } from 'mongoose';

// MongoDB Connection Cache
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(mongoUri);
  isConnected = true;
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
    const trending = await News.find({ isTrending: true })
      .sort({ views: -1, publishedAt: -1 })
      .limit(10)
      .lean();
    res.status(200).json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
