import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import fs from 'fs';
import path from 'path';

// Ensure temp directory exists
const tempDir = path.resolve('public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Created temp directory:', tempDir);
}

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log('✅ MongoDB connected successfully');
        console.log('Database:', process.env.DB_NAME);
        
        app.on('error', () =>{
            console.log("ERROR: ", error);
            throw error;
        })

        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Server is running on port ${process.env.PORT || 8000}`)
        })
    } catch (error) {
        console.log("ERROR: ",error)
        throw error;
    }
})()