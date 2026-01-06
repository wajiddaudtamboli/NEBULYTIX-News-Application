import express, { Router, Request, Response } from 'express';
import News from '../models/News';
import Admin from '../models/Admin';
import { authenticateAdmin } from '../middleware/auth';

const router: Router = express.Router();

// Create or verify admin
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { clerkId, email, name } = req.body;
    const adminSecret = req.headers['x-admin-secret'];

    // Simple admin verification (in production, use Clerk roles)
    const isValidAdmin = adminSecret === process.env.ADMIN_SECRET || 
                         email?.includes('admin@') ||
                         email === 'wajid@nebulytix.com'; // Default admin

    if (!isValidAdmin) {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }

    let admin = await Admin.findOne({ clerkId });

    if (!admin) {
      admin = new Admin({
        clerkId,
        email,
        name,
        role: 'admin',
        permissions: ['create', 'edit', 'delete', 'feature', 'trend'],
      });
      await admin.save();
    }

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify admin',
    });
  }
});

// Create news
router.post('/news/create', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      summary,
      category,
      source,
      coverImage,
      isFeatured,
      isTrending,
      tags,
    } = req.body;

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
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create news',
    });
  }
});

// Update news
router.put('/news/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate category if provided
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

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update news',
    });
  }
});

// Delete news
router.delete('/news/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete news',
    });
  }
});

// Toggle featured
router.patch('/news/:id/featured', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    news.isFeatured = !news.isFeatured;
    await news.save();

    res.json({
      success: true,
      data: news,
      message: `News ${news.isFeatured ? 'marked as' : 'removed from'} featured`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle featured',
    });
  }
});

// Toggle trending
router.patch('/news/:id/trending', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    news.isTrending = !news.isTrending;
    await news.save();

    res.json({
      success: true,
      data: news,
      message: `News ${news.isTrending ? 'marked as' : 'removed from'} trending`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle trending',
    });
  }
});

// Get all news (admin view)
router.get('/news/all', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, string> = {};
    if (category) {
      filter.category = category as string;
    }

    const news = await News.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await News.countDocuments(filter);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch news',
    });
  }
});

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const totalNews = await News.countDocuments();
    const featuredNews = await News.countDocuments({ isFeatured: true });
    const trendingNews = await News.countDocuments({ isTrending: true });

    const newsByCategory = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalViews = await News.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalNews,
        featuredNews,
        trendingNews,
        totalViews: totalViews[0]?.total || 0,
        newsByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    });
  }
});

export default router;
