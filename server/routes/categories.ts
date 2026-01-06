import express, { Router, Request, Response } from 'express';
import Category from '../models/Category.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

// Create category (admin only)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color, isActive, order } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Category name is required (min 2 chars)' });
    }
    
    // Check if category already exists
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      icon: icon || 'folder',
      color: color || '#3b82f6',
      isActive: isActive !== false,
      order: order || 0,
    });
    
    await category.save();
    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color, isActive, order } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Check name uniqueness if changing
    if (name && name !== category.name) {
      const existing = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
      category.name = name.trim();
    }
    
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;
    
    await category.save();
    res.json({ success: true, data: category, message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Prevent deletion of system categories
    const systemCategories = ['Technology', 'Business', 'Science', 'World', 'Health'];
    if (systemCategories.includes(category.name)) {
      return res.status(400).json({ success: false, message: 'Cannot delete system category' });
    }
    
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// Reorder categories (admin only)
router.post('/reorder', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }
    
    const updates = orderedIds.map((id: string, index: number) =>
      Category.findByIdAndUpdate(id, { order: index })
    );
    
    await Promise.all(updates);
    res.json({ success: true, message: 'Categories reordered' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder categories' });
  }
});

// Toggle category active status (admin only)
router.patch('/:id/toggle', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.json({ 
      success: true, 
      data: category, 
      message: `Category ${category.isActive ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle category' });
  }
});

export default router;
