import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS configuration - support multiple environments
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});

app.use('/api', generalLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/admin', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// MongoDB Connection with retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;
let dbConnected = false;

const connectDB = async (retryCount = 0): Promise<boolean> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is not set');
      return false;
    }

    console.log(`🔄 Attempting MongoDB connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    dbConnected = true;
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error:`, error instanceof Error ? error.message : error);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }
    
    return false;
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Routes
import newsRoutes from './routes/news.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

// API v1 routes
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);

// Legacy routes (backward compatibility)
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Convenience routes for featured and trending
app.get('/api/featured', async (req, res) => {
  try {
    const News = (await import('./models/News')).default;
    const featured = await News.find({ isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured news' });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const News = (await import('./models/News')).default;
    const trending = await News.find({ isTrending: true })
      .sort({ publishedAt: -1, views: -1 })
      .limit(10)
      .lean();
    res.json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trending news' });
  }
});

// Standardized error handling middleware
app.use((err: Error & { status?: number; code?: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode === 500 ? 'Internal server error' : err.message,
    code: err.code || 'INTERNAL_ERROR',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Start server with port fallback
const startServer = async () => {
  const preferredPort = parseInt(process.env.PORT || '5000', 10);
  
  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB after multiple attempts');
    console.log('⚠️ Starting server in limited mode...');
  }

  const tryListen = (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port)
        .on('listening', () => {
          console.log(`🚀 Server running on port ${port}`);
          console.log(`📊 Health check: http://localhost:${port}/api/health`);
          if (connected) {
            console.log(`📰 API ready: http://localhost:${port}/api/v1/news`);
          }
          resolve(port);
        })
        .on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is in use, trying ${port + 1}...`);
            server.close();
            tryListen(port + 1).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
    });
  };

  try {
    await tryListen(preferredPort);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
