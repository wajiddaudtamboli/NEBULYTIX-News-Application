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
// Page Schema
const pageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    isSystem: { type: Boolean, default: false },
}, { timestamps: true });
const Page = (mongoose.models.Page || mongoose.model('Page', pageSchema));
// Default system pages
const DEFAULT_PAGES = [
    { title: 'About Us', slug: 'about', content: '<h1>About NEBULYTIX News</h1><p>Your trusted source for news.</p>', status: 'published', isSystem: true },
    { title: 'Privacy Policy', slug: 'privacy', content: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', status: 'published', isSystem: true },
    { title: 'Terms of Service', slug: 'terms', content: '<h1>Terms of Service</h1><p>By using our service, you agree to these terms.</p>', status: 'published', isSystem: true },
];
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    try {
        await connectDB();
        const { id, action, slug } = req.query;
        // GET /api/pages/admin/all - Get all pages for admin
        if (req.method === 'GET' && action === 'all') {
            // Ensure default pages exist
            const count = await Page.countDocuments();
            if (count === 0) {
                await Page.insertMany(DEFAULT_PAGES);
            }
            const pages = await Page.find({}).sort({ createdAt: -1 }).lean();
            return res.status(200).json({ success: true, data: pages });
        }
        // GET - Get page by slug or id (public)
        if (req.method === 'GET') {
            if (slug) {
                const page = await Page.findOne({ slug, status: 'published' }).lean();
                if (!page) {
                    return res.status(404).json({ success: false, message: 'Page not found' });
                }
                return res.status(200).json({ success: true, data: page });
            }
            if (id) {
                const page = await Page.findById(id).lean();
                if (!page) {
                    return res.status(404).json({ success: false, message: 'Page not found' });
                }
                return res.status(200).json({ success: true, data: page });
            }
            // List published pages
            const pages = await Page.find({ status: 'published' }).sort({ title: 1 }).lean();
            return res.status(200).json({ success: true, data: pages });
        }
        // POST - Create page
        if (req.method === 'POST') {
            const { title, content, metaTitle, metaDescription, status: pageStatus } = req.body;
            if (!title || !content) {
                return res.status(400).json({ success: false, message: 'Title and content are required' });
            }
            const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            // Check if slug already exists
            const existing = await Page.findOne({ slug });
            if (existing) {
                return res.status(400).json({ success: false, message: 'A page with this title already exists' });
            }
            const page = new Page({
                title,
                slug,
                content,
                metaTitle: metaTitle || title,
                metaDescription,
                status: pageStatus || 'draft',
                isSystem: false,
            });
            await page.save();
            return res.status(201).json({ success: true, data: page });
        }
        // PUT - Update page
        if (req.method === 'PUT' && id) {
            const { title, content, metaTitle, metaDescription, status: pageStatus } = req.body;
            const updateData = {};
            if (title)
                updateData.title = title;
            if (content)
                updateData.content = content;
            if (metaTitle)
                updateData.metaTitle = metaTitle;
            if (metaDescription !== undefined)
                updateData.metaDescription = metaDescription;
            if (pageStatus)
                updateData.status = pageStatus;
            const page = await Page.findByIdAndUpdate(id, updateData, { new: true });
            if (!page) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            return res.status(200).json({ success: true, data: page });
        }
        // DELETE - Delete page (only non-system pages)
        if (req.method === 'DELETE' && id) {
            const page = await Page.findById(id);
            if (!page) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            if (page.isSystem) {
                return res.status(403).json({ success: false, message: 'System pages cannot be deleted' });
            }
            await Page.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: 'Page deleted' });
        }
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    catch (error) {
        console.error('Pages API error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=pages.js.map