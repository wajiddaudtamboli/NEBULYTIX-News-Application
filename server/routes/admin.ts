import express, { Router, Request, Response } from 'express';
import News from '../models/News.js';
import Admin from '../models/Admin.js';
import { authenticateAdmin, requirePermission, sanitizeQuery } from '../middleware/auth.js';

const router: Router = express.Router();

const VALID_CATEGORIES = ['Technology', 'Business', 'Science', 'World', 'Health'];

// Validate news input
const validateNewsInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (!data.summary || typeof data.summary !== 'string' || data.summary.trim().length < 20) {
    errors.push('Summary must be at least 20 characters');
  }
  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!data.coverImage || typeof data.coverImage !== 'string') {
    errors.push('Cover image URL is required');
  }
  
  return errors;
};

// Create news
router.post('/news/create', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { title, summary, category, source, coverImage, isFeatured, isTrending, tags } = req.body;

    const errors = validateNewsInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const news = new News({
      title: title.trim(),
      summary: summary.trim(),
      category,
      source: source?.trim() || 'Nebulytix',
      coverImage: coverImage.trim(),
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
      publishedAt: new Date(),
    });

    await news.save();
    
    res.status(201).json({
      success: true,
      data: news,
      message: 'News created successfully',
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create news',
    });
  }
});

// Update news
router.put('/news/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = sanitizeQuery(req.body);

    // Validate category if being updated
    if (updates.category && !VALID_CATEGORIES.includes(updates.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdAt;

    const news = await News.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      data: news,
      message: 'News updated successfully',
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news',
    });
  }
});

// Delete news
router.delete('/news/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news',
    });
  }
});

// Toggle featured
router.patch('/news/:id/featured', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    news.isFeatured = !news.isFeatured;
    await news.save();

    res.json({
      success: true,
      data: news,
      message: news.isFeatured ? 'Marked as featured' : 'Removed from featured',
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
    });
  }
});

// Toggle trending
router.patch('/news/:id/trending', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    news.isTrending = !news.isTrending;
    await news.save();

    res.json({
      success: true,
      data: news,
      message: news.isTrending ? 'Marked as trending' : 'Removed from trending',
    });
  } catch (error) {
    console.error('Toggle trending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle trending status',
    });
  }
});

// Get all news (admin view)
router.get('/news/all', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 50, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    
    if (category && VALID_CATEGORIES.includes(category as string)) {
      filter.category = category;
    }
    
    if (search && typeof search === 'string' && search.trim()) {
      filter.$text = { $search: search.trim() };
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
    console.error('Get all news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
});

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const [totalNews, featuredNews, trendingNews, newsByCategory, viewsResult] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ isFeatured: true }),
      News.countDocuments({ isTrending: true }),
      News.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      News.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalNews,
        featuredNews,
        trendingNews,
        totalViews: viewsResult[0]?.total || 0,
        newsByCategory,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
    });
  }
});

// Get single news for editing
router.get('/news/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id).lean();

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
});

export default router;
