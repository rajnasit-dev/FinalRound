import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import fs from 'fs';
import path from 'path';
import { clear, error } from 'console';

// Ensure temp directory exists
const tempDir = path.resolve('public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Created temp directory:', tempDir);
}

const MONGODB_URI = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
//         console.log('✅ MongoDB connected successfully');
//         console.log('Database:', process.env.DB_NAME);
        
//         app.on('error', () =>{
//             console.log("ERROR: ", error);
//             throw error;
//         })

//         app.listen(process.env.PORT || 8000, ()=>{
//             console.log(`Server is running on port ${process.env.PORT || 8000}`)
//         })
//     } catch (error) {
//         console.log("ERROR: ",error)
//         throw error;
//     }
// })()

let isConencted = false;
async function connectDB() {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`, useNewUrlParser=true, useUnifiedTopology=true);
        isConencted=true;
        console.log("Connected to MongoDB:");
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
    }
}

// add Middleware
app.use(async (req, res, next) => {
    try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
})