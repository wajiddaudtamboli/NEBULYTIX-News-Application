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

// Settings Interface
interface ISettings extends Document {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

// Settings Schema
const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'NEBULYTIX News' },
  siteDescription: { type: String, default: 'Your gateway to the stories that shape our world' },
  siteUrl: { type: String, default: 'https://nebulytix-news-application.vercel.app' },
  logo: { type: String },
  favicon: { type: String },
  primaryColor: { type: String, default: '#0891b2' },
  secondaryColor: { type: String, default: '#06b6d4' },
  contactEmail: { type: String, default: 'hr@nebulytixtechnologies.com' },
  contactPhone: { type: String, default: '+91 7660999155' },
  address: { type: String, default: 'Hyderabad, India' },
  socialLinks: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    linkedin: { type: String, default: 'https://www.linkedin.com/company/nebulytix-technologies/' },
    youtube: { type: String },
  },
  analytics: {
    googleAnalyticsId: { type: String },
  },
  seo: {
    metaTitle: { type: String, default: 'NEBULYTIX News - Real-time Global News' },
    metaDescription: { type: String, default: 'Stay informed with NEBULYTIX News - your trusted source for breaking news, technology updates, and global coverage.' },
    keywords: [{ type: String }],
  },
}, { timestamps: true });

const Settings = (mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema)) as Model<ISettings>;

// Default settings
const DEFAULT_SETTINGS = {
  siteName: 'NEBULYTIX News',
  siteDescription: 'Your gateway to the stories that shape our world',
  siteUrl: 'https://nebulytix-news-application.vercel.app',
  primaryColor: '#0891b2',
  secondaryColor: '#06b6d4',
  contactEmail: 'hr@nebulytixtechnologies.com',
  contactPhone: '+91 7660999155',
  address: 'Hyderabad, India',
  socialLinks: {
    linkedin: 'https://www.linkedin.com/company/nebulytix-technologies/',
  },
  seo: {
    metaTitle: 'NEBULYTIX News - Real-time Global News',
    metaDescription: 'Stay informed with NEBULYTIX News - your trusted source for breaking news, technology updates, and global coverage.',
    keywords: ['news', 'technology', 'business', 'science', 'health', 'world news'],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // GET - Get settings
    if (req.method === 'GET') {
      let settings = await Settings.findOne({}).lean();
      
      // Create default settings if none exist
      if (!settings) {
        const newSettings = new Settings(DEFAULT_SETTINGS);
        await newSettings.save();
        settings = newSettings.toObject();
      }

      return res.status(200).json({ success: true, data: settings });
    }

    // PUT - Update settings
    if (req.method === 'PUT') {
      const updateData = req.body;
      
      let settings = await Settings.findOne({});
      
      if (!settings) {
        // Create with defaults + updates
        settings = new Settings({ ...DEFAULT_SETTINGS, ...updateData });
        await settings.save();
      } else {
        // Update existing
        Object.assign(settings, updateData);
        await settings.save();
      }

      return res.status(200).json({ success: true, data: settings });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Settings API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
