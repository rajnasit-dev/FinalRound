import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';


( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
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