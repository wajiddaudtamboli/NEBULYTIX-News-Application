import mongoose from 'mongoose';
// MongoDB Connection Cache for serverless
let cachedConnection = null;
const connectDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri)
        return null;
    try {
        mongoose.set('bufferCommands', false);
        const conn = await mongoose.connect(mongoUri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        cachedConnection = conn;
        return conn;
    }
    catch {
        return null;
    }
};
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // Check environment variables
    const hasMongoUri = !!process.env.MONGODB_URI;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const hasClerkKey = !!process.env.VITE_CLERK_PUBLISHABLE_KEY;
    // Try database connection
    let dbStatus = 'not_configured';
    let dbMessage = 'MONGODB_URI not set';
    if (hasMongoUri) {
        try {
            const conn = await connectDB();
            if (conn && mongoose.connection.readyState === 1) {
                dbStatus = 'connected';
                dbMessage = 'Successfully connected to MongoDB';
            }
            else {
                dbStatus = 'disconnected';
                dbMessage = 'Connection state: ' + mongoose.connection.readyState;
            }
        }
        catch (error) {
            dbStatus = 'error';
            dbMessage = error instanceof Error ? error.message : 'Unknown error';
        }
    }
    res.status(200).json({
        success: true,
        message: 'NEBULYTIX News API Health Check',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: {
            mongodb: hasMongoUri ? 'configured' : 'missing',
            jwt_secret: hasJwtSecret ? 'configured' : 'using_default',
            clerk: hasClerkKey ? 'configured' : 'missing',
        },
        database: {
            status: dbStatus,
            message: dbMessage,
        }
    });
}
//# sourceMappingURL=health.js.map