import express, { Router, Request, Response } from 'express';
import Enquiry from '../models/Enquiry.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Submit enquiry (public)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!subject || subject.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
    }
    
    const enquiry = new Enquiry({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      type: type || 'general',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    await enquiry.save();
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('Submit enquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry' });
  }
});

// Get all enquiries (admin only)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
    
    const total = await Enquiry.countDocuments(filter);
    const unreadCount = await Enquiry.countDocuments({ status: 'new' });
    
    res.json({
      success: true,
      data: enquiries,
      unreadCount,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
});

// Get enquiry stats (admin only)
router.get('/stats', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await Enquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Enquiry.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Enquiry.countDocuments();
    
    res.json({
      success: true,
      data: {
        total,
        byStatus: stats.reduce((acc: any, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        byType: typeStats.reduce((acc: any, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiry stats' });
  }
});

// Get single enquiry (admin only)
router.get('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    // Mark as read if new
    if (enquiry.status === 'new') {
      enquiry.status = 'read';
      await enquiry.save();
    }
    
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiry' });
  }
});

// Update enquiry status (admin only)
router.patch('/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    res.json({ success: true, data: enquiry, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Mark as important (admin only)
router.patch('/:id/important', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    enquiry.isImportant = !enquiry.isImportant;
    await enquiry.save();
    
    res.json({ 
      success: true, 
      data: enquiry, 
      message: `Marked as ${enquiry.isImportant ? 'important' : 'not important'}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update enquiry' });
  }
});

// Reply to enquiry (admin only)
router.post('/:id/reply', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { reply } = req.body;
    
    if (!reply || reply.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Reply must be at least 10 characters' });
    }
    
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    enquiry.reply = reply.trim();
    enquiry.repliedAt = new Date();
    enquiry.repliedBy = (req as any).admin?.email || 'Admin';
    enquiry.status = 'replied';
    
    await enquiry.save();
    
    // In a real app, you'd send an email here
    
    res.json({ success: true, data: enquiry, message: 'Reply saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save reply' });
  }
});

// Delete enquiry (admin only)
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete enquiry' });
  }
});

// Bulk delete (admin only)
router.post('/bulk-delete', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    
    const result = await Enquiry.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${result.deletedCount} enquiries deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete enquiries' });
  }
});

// Bulk update status (admin only)
router.post('/bulk-status', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const result = await Enquiry.updateMany({ _id: { $in: ids } }, { status });
    res.json({ success: true, message: `${result.modifiedCount} enquiries updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update enquiries' });
  }
});

export default router;
