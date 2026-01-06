import express, { Router, Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings.js';
import HomeContent from '../models/HomeContent.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Get site settings (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne().lean();
    
    // Create default settings if none exist
    if (!settings) {
      const defaultSettings = new SiteSettings();
      await defaultSettings.save();
      settings = defaultSettings.toObject();
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Update site settings (admin only)
router.put('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings(updates);
    } else {
      Object.assign(settings, updates);
    }
    
    await settings.save();
    res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Get home page content (public)
router.get('/home', async (req: Request, res: Response) => {
  try {
    let homeContent = await HomeContent.findOne().lean();
    
    // Create default if none exists
    if (!homeContent) {
      const defaultContent = new HomeContent();
      await defaultContent.save();
      homeContent = defaultContent.toObject();
    }
    
    res.json({ success: true, data: homeContent });
  } catch (error) {
    console.error('Get home content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch home content' });
  }
});

// Update home page content (admin only)
router.put('/home', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    let homeContent = await HomeContent.findOne();
    
    if (!homeContent) {
      homeContent = new HomeContent(updates);
    } else {
      Object.assign(homeContent, updates);
    }
    
    await homeContent.save();
    res.json({ success: true, data: homeContent, message: 'Home content updated' });
  } catch (error) {
    console.error('Update home content error:', error);
    res.status(500).json({ success: false, message: 'Failed to update home content' });
  }
});

// Add hero slide (admin only)
router.post('/home/hero', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { heading, subtext, buttonText, buttonLink, imageUrl, isActive } = req.body;
    
    if (!heading || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Heading and image are required' });
    }
    
    let homeContent = await HomeContent.findOne();
    if (!homeContent) {
      homeContent = new HomeContent();
    }
    
    const newSlide = {
      id: `slide-${Date.now()}`,
      isActive: isActive !== false,
      heading,
      subtext: subtext || '',
      buttonText: buttonText || 'Read More',
      buttonLink: buttonLink || '/',
      imageUrl,
      order: homeContent.heroSlides.length,
    };
    
    homeContent.heroSlides.push(newSlide);
    await homeContent.save();
    
    res.status(201).json({ success: true, data: newSlide, message: 'Hero slide added' });
  } catch (error) {
    console.error('Add hero slide error:', error);
    res.status(500).json({ success: false, message: 'Failed to add hero slide' });
  }
});

// Update hero slide (admin only)
router.put('/home/hero/:slideId', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slideId } = req.params;
    const updates = req.body;
    
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ success: false, message: 'Home content not found' });
    }
    
    const slideIndex = homeContent.heroSlides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }
    
    Object.assign(homeContent.heroSlides[slideIndex], updates);
    await homeContent.save();
    
    res.json({ success: true, data: homeContent.heroSlides[slideIndex], message: 'Slide updated' });
  } catch (error) {
    console.error('Update hero slide error:', error);
    res.status(500).json({ success: false, message: 'Failed to update slide' });
  }
});

// Delete hero slide (admin only)
router.delete('/home/hero/:slideId', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { slideId } = req.params;
    
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ success: false, message: 'Home content not found' });
    }
    
    homeContent.heroSlides = homeContent.heroSlides.filter(s => s.id !== slideId);
    await homeContent.save();
    
    res.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    console.error('Delete hero slide error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete slide' });
  }
});

// Add banner section (admin only)
router.post('/home/banner', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, buttonText, buttonLink, isActive } = req.body;
    
    let homeContent = await HomeContent.findOne();
    if (!homeContent) {
      homeContent = new HomeContent();
    }
    
    const newBanner = {
      id: `banner-${Date.now()}`,
      isActive: isActive !== false,
      title: title || '',
      description: description || '',
      imageUrl: imageUrl || '',
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      order: homeContent.bannerSections.length,
    };
    
    homeContent.bannerSections.push(newBanner);
    await homeContent.save();
    
    res.status(201).json({ success: true, data: newBanner, message: 'Banner added' });
  } catch (error) {
    console.error('Add banner error:', error);
    res.status(500).json({ success: false, message: 'Failed to add banner' });
  }
});

// Update banner section (admin only)
router.put('/home/banner/:bannerId', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { bannerId } = req.params;
    const updates = req.body;
    
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ success: false, message: 'Home content not found' });
    }
    
    const bannerIndex = homeContent.bannerSections.findIndex(b => b.id === bannerId);
    if (bannerIndex === -1) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    
    Object.assign(homeContent.bannerSections[bannerIndex], updates);
    await homeContent.save();
    
    res.json({ success: true, data: homeContent.bannerSections[bannerIndex], message: 'Banner updated' });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, message: 'Failed to update banner' });
  }
});

// Delete banner section (admin only)
router.delete('/home/banner/:bannerId', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { bannerId } = req.params;
    
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      return res.status(404).json({ success: false, message: 'Home content not found' });
    }
    
    homeContent.bannerSections = homeContent.bannerSections.filter(b => b.id !== bannerId);
    await homeContent.save();
    
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
});

export default router;
