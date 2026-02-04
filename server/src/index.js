import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import app from './app.js';

console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
console.log('🔧 DB Name:', process.env.DB_NAME);

// Ensure temp directory exists
const tempDir = path.resolve('public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('✅ Created temp directory:', tempDir);
}

const PORT = process.env.PORT || 3000;

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

console.log(`🚀 Starting server on port ${PORT}...`);
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
});

// For Vercel serverless
export default app;