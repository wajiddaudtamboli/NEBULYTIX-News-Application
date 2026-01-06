import express, { Router, Request, Response } from 'express';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';

const router: Router = express.Router();

// Create or get user
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({ clerkId, email, name });
      await user.save();
    } else {
      // Update user info if needed
      if (email) user.email = email;
      if (name) user.name = name;
      await user.save();
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync user',
    });
  }
});

// Get user profile
router.get('/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ clerkId: req.user?.clerkId })
      .populate('savedArticles')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    });
  }
});

// Save article
router.post('/save/:newsId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const user = await User.findOne({ clerkId: req.user?.clerkId });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isSaved = user.savedArticles.includes(newsId as any);

    if (isSaved) {
      user.savedArticles = user.savedArticles.filter((id: any) => id.toString() !== newsId);
    } else {
      user.savedArticles.push(newsId as any);
    }

    await user.save();

    res.json({
      success: true,
      message: isSaved ? 'Article removed from saved' : 'Article saved',
      data: { isSaved: !isSaved },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save article',
    });
  }
});

// Get saved articles
router.get('/saved/all', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ clerkId: req.user?.clerkId }).populate('savedArticles');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user.savedArticles });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch saved articles',
    });
  }
});

export default router;
