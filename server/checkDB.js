import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User.model.js';

async function checkDB() {
  try {
    const MONGODB_URI = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
    console.log('🔗 Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count all users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}\n`);

    // Find specific test users
    const testEmails = [
      'rajnasit@gmail.com',
      'krishsanghani@gmail.com',
      'udayodedara@gujaratsportsfederation.com',
      'admin@gmail.com'
    ];

    console.log('🔍 Checking test accounts:');
    for (const email of testEmails) {
      const user = await User.findOne({ email }).lean();
      if (user) {
        console.log(`✅ Found: ${email}`);
        console.log(`   Name: ${user.fullName}`);
        console.log(`   Role field value:`, user.role);
        console.log(`   Role type:`, typeof user.role);
      } else {
        console.log(`❌ NOT FOUND: ${email}`);
      }
    }

    // List all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find().select('email fullName role').limit(50);
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDB();
