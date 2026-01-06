import express, { Router, Request, Response } from 'express';
import Media from '../models/Media.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Get all media (admin only)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 30, type, folder, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 30;
    
    const filter: any = {};
    if (type) filter.type = type;
    if (folder) filter.folder = folder;
    if (search) {
      filter.$text = { $search: search as string };
    }
    
    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    
    const total = await Media.countDocuments(filter);
    
    res.json({
      success: true,
      data: media,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Get folders list
router.get('/folders', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const folders = await Media.distinct('folder');
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch folders' });
  }
});

// Get single media item
router.get('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const media = await Media.findById(req.params.id).lean();
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Add media (URL-based, not actual upload)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { url, originalName, type, mimeType, size, width, height, alt, caption, folder } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    
    // Generate filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || `media-${Date.now()}`;
    
    const media = new Media({
      filename,
      originalName: originalName || filename,
      url,
      type: type || 'image',
      mimeType: mimeType || 'image/jpeg',
      size: size || 0,
      width,
      height,
      alt: alt || '',
      caption: caption || '',
      folder: folder || 'general',
      uploadedBy: (req as any).admin?.email,
    });
    
    await media.save();
    res.status(201).json({ success: true, data: media, message: 'Media added' });
  } catch (error) {
    console.error('Add media error:', error);
    res.status(500).json({ success: false, message: 'Failed to add media' });
  }
});

// Update media metadata
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { alt, caption, folder } = req.body;
    
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    
    if (alt !== undefined) media.alt = alt;
    if (caption !== undefined) media.caption = caption;
    if (folder !== undefined) media.folder = folder;
    
    await media.save();
    res.json({ success: true, data: media, message: 'Media updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update media' });
  }
});

// Delete media
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete media' });
  }
});

// Bulk delete
router.post('/bulk-delete', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    
    const result = await Media.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${result.deletedCount} items deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete media' });
  }
});

// Move to folder
router.post('/move', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { ids, folder } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    
    const result = await Media.updateMany({ _id: { $in: ids } }, { folder: folder || 'general' });
    res.json({ success: true, message: `${result.modifiedCount} items moved` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to move media' });
  }
});

// Increment usage count
router.post('/:id/use', async (req: Request, res: Response) => {
  try {
    await Media.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update usage' });
  }
});

export default router;
