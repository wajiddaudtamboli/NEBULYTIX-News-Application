import express, { Router, Request, Response } from 'express';
import Blog from '../models/Blog.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Get all blogs (public - only published)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    
    const filter: any = { isPublished: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    
    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    
    const total = await Blog.countDocuments(filter);
    
    res.json({
      success: true,
      data: blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
});

// Get single blog by slug (public)
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog' });
  }
});

// Get single blog by ID (admin)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog' });
  }
});

// Get all blogs for admin (includes unpublished)
router.get('/admin/all', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    
    const total = await Blog.countDocuments();
    
    res.json({
      success: true,
      data: blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
});

// Create blog (admin only)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, author, category, tags, isFeatured, isPublished } = req.body;
    
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Title must be at least 5 characters' });
    }
    if (!excerpt || excerpt.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Excerpt must be at least 20 characters' });
    }
    if (!content || content.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Content must be at least 50 characters' });
    }
    if (!coverImage) {
      return res.status(400).json({ success: false, message: 'Cover image is required' });
    }
    
    const blog = new Blog({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      author: author || 'NEBULYTIX Team',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
      isPublished: Boolean(isPublished),
    });
    
    await blog.save();
    res.status(201).json({ success: true, data: blog, message: 'Blog created' });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ success: false, message: 'Failed to create blog' });
  }
});

// Update blog (admin only)
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    const { title, excerpt, content, coverImage, author, category, tags, isFeatured, isPublished } = req.body;
    
    if (title) blog.title = title.trim();
    if (excerpt) blog.excerpt = excerpt.trim();
    if (content) blog.content = content.trim();
    if (coverImage) blog.coverImage = coverImage;
    if (author) blog.author = author;
    if (category) blog.category = category;
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : [];
    if (isFeatured !== undefined) blog.isFeatured = Boolean(isFeatured);
    if (isPublished !== undefined) blog.isPublished = Boolean(isPublished);
    
    await blog.save();
    res.json({ success: true, data: blog, message: 'Blog updated' });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ success: false, message: 'Failed to update blog' });
  }
});

// Delete blog (admin only)
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
});

// Toggle publish status (admin only)
router.patch('/:id/toggle-publish', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    blog.isPublished = !blog.isPublished;
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    res.json({ success: true, data: blog, message: `Blog ${blog.isPublished ? 'published' : 'unpublished'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle publish status' });
  }
});

// Toggle featured status (admin only)
router.patch('/:id/toggle-featured', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    
    res.json({ success: true, data: blog, message: `Blog ${blog.isFeatured ? 'featured' : 'unfeatured'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle featured status' });
  }
});

export default router;
