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
// Media Schema
const mediaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
    size: { type: Number, default: 0 },
    folder: { type: String, default: 'general' },
    alt: { type: String },
}, { timestamps: true });
// Folder Schema
const folderSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
}, { timestamps: true });
const Media = (mongoose.models.Media || mongoose.model('Media', mediaSchema));
const Folder = (mongoose.models.Folder || mongoose.model('Folder', folderSchema));
// Default folders
const DEFAULT_FOLDERS = [
    { name: 'General', slug: 'general' },
    { name: 'News Images', slug: 'news-images' },
    { name: 'Blog Images', slug: 'blog-images' },
];
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    try {
        await connectDB();
        const { id, action, folder, type } = req.query;
        // GET /api/media/folders - Get all folders
        if (req.method === 'GET' && action === 'folders') {
            // Ensure default folders exist
            const count = await Folder.countDocuments();
            if (count === 0) {
                await Folder.insertMany(DEFAULT_FOLDERS);
            }
            const folders = await Folder.find({}).sort({ name: 1 }).lean();
            return res.status(200).json({ success: true, data: folders });
        }
        // POST /api/media/folders - Create folder
        if (req.method === 'POST' && action === 'folders') {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Folder name is required' });
            }
            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const existingFolder = await Folder.findOne({ slug });
            if (existingFolder) {
                return res.status(400).json({ success: false, message: 'Folder already exists' });
            }
            const newFolder = new Folder({ name, slug });
            await newFolder.save();
            return res.status(201).json({ success: true, data: newFolder });
        }
        // GET - List media files
        if (req.method === 'GET') {
            const query = {};
            if (folder)
                query.folder = folder;
            if (type)
                query.type = type;
            const media = await Media.find(query).sort({ createdAt: -1 }).lean();
            return res.status(200).json({ success: true, data: media });
        }
        // POST - Add media (URL-based, no file upload)
        if (req.method === 'POST') {
            const { name, url, type: mediaType, size, folder: mediaFolder, alt } = req.body;
            if (!name || !url) {
                return res.status(400).json({ success: false, message: 'Name and URL are required' });
            }
            const media = new Media({
                name,
                url,
                type: mediaType || 'image',
                size: size || 0,
                folder: mediaFolder || 'general',
                alt,
            });
            await media.save();
            return res.status(201).json({ success: true, data: media });
        }
        // PUT - Update media
        if (req.method === 'PUT' && id) {
            const { name, alt, folder: mediaFolder } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (alt !== undefined)
                updateData.alt = alt;
            if (mediaFolder)
                updateData.folder = mediaFolder;
            const media = await Media.findByIdAndUpdate(id, updateData, { new: true });
            if (!media) {
                return res.status(404).json({ success: false, message: 'Media not found' });
            }
            return res.status(200).json({ success: true, data: media });
        }
        // DELETE - Delete media
        if (req.method === 'DELETE' && id) {
            const media = await Media.findByIdAndDelete(id);
            if (!media) {
                return res.status(404).json({ success: false, message: 'Media not found' });
            }
            return res.status(200).json({ success: true, message: 'Media deleted' });
        }
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    catch (error) {
        console.error('Media API error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=media.js.map