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

// Blog Interface
interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  status: 'draft' | 'published';
  tags: string[];
  views: number;
}

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  author: { type: String, default: 'Admin' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
}, { timestamps: true });

const Blog = (mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema)) as Model<IBlog>;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    const { id, action, status } = req.query;

    // GET /api/blogs/admin/all - Get all blogs for admin
    if (req.method === 'GET' && action === 'all') {
      const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: blogs });
    }

    // GET - List published blogs (public) or single blog
    if (req.method === 'GET') {
      if (id) {
        const blog = await Blog.findById(id).lean();
        if (!blog) {
          return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        return res.status(200).json({ success: true, data: blog });
      }

      const query = status ? { status } : { status: 'published' };
      const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: blogs });
    }

    // POST - Create blog
    if (req.method === 'POST') {
      const { title, content, excerpt, coverImage, author, status: blogStatus, tags } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
      }

      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      
      const blog = new Blog({
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        coverImage,
        author: author || 'Admin',
        status: blogStatus || 'draft',
        tags: tags || [],
      });

      await blog.save();
      return res.status(201).json({ success: true, data: blog });
    }

    // PUT - Update blog
    if (req.method === 'PUT' && id) {
      const { title, content, excerpt, coverImage, author, status: blogStatus, tags } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (title) {
        updateData.title = title;
        updateData.slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      }
      if (content) updateData.content = content;
      if (excerpt) updateData.excerpt = excerpt;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (author) updateData.author = author;
      if (blogStatus) updateData.status = blogStatus;
      if (tags) updateData.tags = tags;

      const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
      
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }

      return res.status(200).json({ success: true, data: blog });
    }

    // DELETE - Delete blog
    if (req.method === 'DELETE' && id) {
      const blog = await Blog.findByIdAndDelete(id);
      
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }

      return res.status(200).json({ success: true, message: 'Blog deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Blogs API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
