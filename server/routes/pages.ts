import express, { Router, Request, Response } from 'express';
import Page from '../models/Page.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Get all pages (public - only published)
router.get('/', async (req: Request, res: Response) => {
  try {
    const pages = await Page.find({ isPublished: true })
      .select('title slug description isSystemPage')
      .sort({ title: 1 })
      .lean();
    
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pages' });
  }
});

// Get page by slug (public)
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch page' });
  }
});

// Get all pages for admin (includes unpublished)
router.get('/admin/all', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const pages = await Page.find().sort({ isSystemPage: -1, title: 1 }).lean();
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pages' });
  }
});

// Get single page by ID (admin)
router.get('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id).lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch page' });
  }
});

// Create page (admin only)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { title, slug, description, sections, isPublished, metaTitle, metaDescription } = req.body;
    
    if (!title || title.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    const pageSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check slug uniqueness
    const existing = await Page.findOne({ slug: pageSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Page with this slug already exists' });
    }
    
    const page = new Page({
      title: title.trim(),
      slug: pageSlug,
      description,
      sections: sections || [],
      isPublished: Boolean(isPublished),
      isSystemPage: false,
      metaTitle,
      metaDescription,
    });
    
    await page.save();
    res.status(201).json({ success: true, data: page, message: 'Page created' });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ success: false, message: 'Failed to create page' });
  }
});

// Update page (admin only)
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    const { title, slug, description, sections, isPublished, metaTitle, metaDescription } = req.body;
    
    // Check slug uniqueness if changing
    if (slug && slug !== page.slug) {
      const existing = await Page.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Page with this slug already exists' });
      }
      page.slug = slug;
    }
    
    if (title) page.title = title.trim();
    if (description !== undefined) page.description = description;
    if (sections !== undefined) page.sections = sections;
    if (isPublished !== undefined) page.isPublished = Boolean(isPublished);
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    
    await page.save();
    res.json({ success: true, data: page, message: 'Page updated' });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ success: false, message: 'Failed to update page' });
  }
});

// Delete page (admin only)
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    // Prevent deletion of system pages
    if (page.isSystemPage) {
      return res.status(400).json({ success: false, message: 'Cannot delete system page' });
    }
    
    await page.deleteOne();
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete page' });
  }
});

// Add section to page (admin only)
router.post('/:id/sections', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    const { type, title, subtitle, content, imageUrl, videoUrl, buttonText, buttonLink, isActive, settings } = req.body;
    
    if (!type) {
      return res.status(400).json({ success: false, message: 'Section type is required' });
    }
    
    const newSection = {
      id: `section-${Date.now()}`,
      type,
      title,
      subtitle,
      content,
      imageUrl,
      videoUrl,
      buttonText,
      buttonLink,
      isActive: isActive !== false,
      order: page.sections.length,
      settings,
    };
    
    page.sections.push(newSection);
    await page.save();
    
    res.status(201).json({ success: true, data: newSection, message: 'Section added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add section' });
  }
});

// Update section (admin only)
router.put('/:id/sections/:sectionId', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    const sectionIndex = page.sections.findIndex(s => s.id === req.params.sectionId);
    if (sectionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    
    Object.assign(page.sections[sectionIndex], req.body);
    await page.save();
    
    res.json({ success: true, data: page.sections[sectionIndex], message: 'Section updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update section' });
  }
});

// Delete section (admin only)
router.delete('/:id/sections/:sectionId', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    page.sections = page.sections.filter(s => s.id !== req.params.sectionId);
    await page.save();
    
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
});

// Reorder sections (admin only)
router.post('/:id/sections/reorder', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    // Reorder sections based on orderedIds
    const reorderedSections = orderedIds.map((id: string, index: number) => {
      const section = page.sections.find(s => s.id === id);
      if (section) {
        section.order = index;
        return section;
      }
      return null;
    }).filter(Boolean);
    
    page.sections = reorderedSections;
    await page.save();
    
    res.json({ success: true, message: 'Sections reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reorder sections' });
  }
});

export default router;
