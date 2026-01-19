import mongoose from 'mongoose';
// MongoDB Connection Cache for serverless
let cachedConnection = null;
let connectionPromise = null;
const connectDB = async (retries = 2) => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    if (connectionPromise) {
        return connectionPromise;
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri)
        throw new Error('MONGODB_URI is not set');
    connectionPromise = (async () => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                mongoose.set('bufferCommands', false);
                mongoose.set('strictQuery', true);
                const conn = await mongoose.connect(mongoUri, {
                    bufferCommands: false,
                    maxPoolSize: 3,
                    serverSelectionTimeoutMS: 4000,
                    socketTimeoutMS: 15000,
                    connectTimeoutMS: 4000,
                });
                cachedConnection = conn;
                connectionPromise = null;
                return conn;
            }
            catch (error) {
                console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);
                if (attempt === retries) {
                    connectionPromise = null;
                    throw new Error(`MongoDB connection failed after ${retries} attempts`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw new Error('MongoDB connection failed');
    })();
    return connectionPromise;
};
// Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });
const Category = (mongoose.models.Category || mongoose.model('Category', categorySchema));
// Default categories
const DEFAULT_CATEGORIES = [
    { name: 'Technology', slug: 'technology', description: 'Tech news and innovations', isActive: true, order: 1 },
    { name: 'Business', slug: 'business', description: 'Business and finance news', isActive: true, order: 2 },
    { name: 'Science', slug: 'science', description: 'Scientific discoveries', isActive: true, order: 3 },
    { name: 'World', slug: 'world', description: 'Global news and events', isActive: true, order: 4 },
    { name: 'Health', slug: 'health', description: 'Health and wellness', isActive: true, order: 5 },
];
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    try {
        await connectDB();
        const { id, action, includeInactive } = req.query;
        // GET - List all categories
        if (req.method === 'GET') {
            // Ensure default categories exist
            const count = await Category.countDocuments();
            if (count === 0) {
                await Category.insertMany(DEFAULT_CATEGORIES);
            }
            const query = includeInactive === 'true' ? {} : { isActive: true };
            const categories = await Category.find(query).sort({ order: 1 }).lean();
            return res.status(200).json({ success: true, data: categories });
        }
        // POST - Create category
        if (req.method === 'POST') {
            const { name, description, isActive, order } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Name is required' });
            }
            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const category = new Category({
                name,
                slug,
                description,
                isActive: isActive !== false,
                order: order || 0,
            });
            await category.save();
            return res.status(201).json({ success: true, data: category });
        }
        // PUT - Update category
        if (req.method === 'PUT' && id) {
            const { name, description, isActive, order } = req.body;
            const updateData = {};
            if (name) {
                updateData.name = name;
                updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }
            if (description !== undefined)
                updateData.description = description;
            if (isActive !== undefined)
                updateData.isActive = isActive;
            if (order !== undefined)
                updateData.order = order;
            const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            return res.status(200).json({ success: true, data: category });
        }
        // DELETE - Delete category
        if (req.method === 'DELETE' && id) {
            const category = await Category.findByIdAndDelete(id);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            return res.status(200).json({ success: true, message: 'Category deleted' });
        }
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    catch (error) {
        console.error('Categories API error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=categories.js.map