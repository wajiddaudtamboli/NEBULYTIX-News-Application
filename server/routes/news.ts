import express, { Router, Request, Response } from 'express';
import News from '../models/News.js';
import User from '../models/User.js';
import { optionalAuth, authenticateUser } from '../middleware/auth.js';

const router: Router = express.Router();

// Get all news with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category = 'All',
      page = 1,
      limit = 20,
      date,
      featured = false,
      trending = false,
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      filter.publishedAt = { $gte: startDate, $lte: endDate };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (trending === 'true') {
      filter.isTrending = true;
    }

    const news = await News.find(filter)
      .sort({ publishedAt: -1, views: -1 })
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

// Get featured news
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const featured = await News.find({ isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch featured news',
    });
  }
});

// Get trending news
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const trending = await News.find({ isTrending: true })
      .sort({ publishedAt: -1, views: -1 })
      .limit(10)
      .lean();

    res.json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trending news',
    });
  }
});

// Get single news by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id).lean();

    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }

    // Increment views
    await News.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch news',
    });
  }
});

// Get categories available
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const categories = await News.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    });
  }
});

export default router;
