import 'dotenv/config';
import app from './app.js';
import fs from 'fs';
import path from 'path';

// Ensure temp directory exists
const tempDir = path.resolve('public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Created temp directory:', tempDir);
}

// For Vercel serverless
export default app;