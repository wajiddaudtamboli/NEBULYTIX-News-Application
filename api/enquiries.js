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
// Enquiry Schema
const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
    phone: { type: String },
}, { timestamps: true });
const Enquiry = (mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema));
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    try {
        await connectDB();
        const { id, action, status } = req.query;
        // GET /api/enquiries/stats - Get stats
        if (req.method === 'GET' && action === 'stats') {
            const [total, newCount, readCount, repliedCount] = await Promise.all([
                Enquiry.countDocuments(),
                Enquiry.countDocuments({ status: 'new' }),
                Enquiry.countDocuments({ status: 'read' }),
                Enquiry.countDocuments({ status: 'replied' }),
            ]);
            return res.status(200).json({
                success: true,
                data: {
                    total,
                    new: newCount,
                    read: readCount,
                    replied: repliedCount,
                }
            });
        }
        // GET - List all enquiries
        if (req.method === 'GET') {
            const query = status ? { status } : {};
            const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).lean();
            return res.status(200).json({ success: true, data: enquiries });
        }
        // POST - Create enquiry (from contact form)
        if (req.method === 'POST') {
            const { name, email, subject, message, phone } = req.body;
            if (!name || !email || !subject || !message) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }
            const enquiry = new Enquiry({
                name,
                email,
                subject,
                message,
                phone,
                status: 'new',
            });
            await enquiry.save();
            return res.status(201).json({ success: true, data: enquiry, message: 'Enquiry submitted successfully' });
        }
        // PUT - Update enquiry status
        if (req.method === 'PUT' && id) {
            const { status: newStatus } = req.body;
            const enquiry = await Enquiry.findByIdAndUpdate(id, { status: newStatus }, { new: true });
            if (!enquiry) {
                return res.status(404).json({ success: false, message: 'Enquiry not found' });
            }
            return res.status(200).json({ success: true, data: enquiry });
        }
        // DELETE - Delete enquiry
        if (req.method === 'DELETE' && id) {
            const enquiry = await Enquiry.findByIdAndDelete(id);
            if (!enquiry) {
                return res.status(404).json({ success: false, message: 'Enquiry not found' });
            }
            return res.status(200).json({ success: true, message: 'Enquiry deleted' });
        }
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    catch (error) {
        console.error('Enquiries API error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=enquiries.js.map