import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import { Sport } from './src/models/Sport.model.js';
import { Player } from './src/models/Player.model.js';
import { TeamManager } from './src/models/TeamManager.model.js';
import { TournamentOrganizer } from './src/models/TournamentOrganizer.model.js';
import { Admin } from './src/models/Admin.model.js';
import { Team } from './src/models/Team.model.js';
import { Tournament } from './src/models/Tournament.model.js';
import { Match } from './src/models/Match.model.js';
import { Payment } from './src/models/Payment.model.js';
import { Request } from './src/models/Request.model.js';
import Booking from './src/models/Booking.model.js';
import { Feedback } from './src/models/Feedback.model.js';

// Same password for all users
const DEFAULT_PASSWORD = 'Password123!';

async function connectDB() {
  try {
    const MONGODB_URI = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await Sport.deleteMany({});
  await Player.deleteMany({});
  await TeamManager.deleteMany({});
  await TournamentOrganizer.deleteMany({});
  await Admin.deleteMany({});
  await Team.deleteMany({});
  await Tournament.deleteMany({});
  await Match.deleteMany({});
  await Payment.deleteMany({});
  await Request.deleteMany({});
  await Booking.deleteMany({});
  await Feedback.deleteMany({});
  console.log('✅ Database cleared');
}

async function seedSports() {
  console.log('🏃 Seeding sports...');
  
  const sports = [
    { name: 'Cricket', teamBased: true, playersPerTeam: 11, roles: ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'] },
    { name: 'Football', teamBased: true, playersPerTeam: 11, roles: ['Striker', 'Midfielder', 'Defender', 'Goalkeeper'] },
    { name: 'Basketball', teamBased: true, playersPerTeam: 5, roles: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'] },
    { name: 'Volleyball', teamBased: true, playersPerTeam: 6, roles: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'] },
    { name: 'Hockey', teamBased: true, playersPerTeam: 11, roles: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] },
    { name: 'Badminton', teamBased: false, playersPerTeam: 1, roles: ['Singles Player', 'Doubles Player'] },
    { name: 'Tennis', teamBased: false, playersPerTeam: 1, roles: ['Singles Player', 'Doubles Player'] },
    { name: 'Table Tennis', teamBased: false, playersPerTeam: 1, roles: ['Singles Player', 'Doubles Player'] },
    { name: 'Chess', teamBased: false, playersPerTeam: 1, roles: ['Player'] },
    { name: 'Kabaddi', teamBased: true, playersPerTeam: 7, roles: ['Raider', 'Defender', 'All-rounder'] },
    { name: 'Rugby', teamBased: true, playersPerTeam: 15, roles: ['Forward', 'Back', 'Scrum-half', 'Fly-half'] },
    { name: 'Baseball', teamBased: true, playersPerTeam: 9, roles: ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'] },
  ];

  const createdSports = await Sport.insertMany(sports);
  console.log(`✅ Seeded ${createdSports.length} sports`);
  return createdSports;
}

async function seedAdmin() {
  console.log('👤 Seeding admin...');
  
  const admin = await Admin.create({
    fullName: 'Admin User',
    email: 'admin@gmail.com',
    password: DEFAULT_PASSWORD,
    isVerified: true,
    isActive: true,
  });

  console.log('✅ Seeded admin user');
  return admin;
}

async function seedPlayer(sports) {
  console.log('🎮 Seeding player...');
  
  const player = await Player.create({
    fullName: 'Raj Nasit',
    email: 'rajnasit@gmail.com',
    password: DEFAULT_PASSWORD,
    phone: '+91-98765-43210',
    city: 'Ahmedabad',
    isVerified: true,
    isActive: true,
    sports: [
      { sport: sports[0]._id, role: 'All-rounder' }, // Cricket
      { sport: sports[1]._id, role: 'Striker' }, // Football
      { sport: sports[2]._id, role: 'Point Guard' }, // Basketball
    ],
    gender: 'Male',
    dateOfBirth: new Date('1998-05-15'),
    height: 180,
    weight: 75,
    bio: 'Passionate multi-sport athlete from Gujarat with 10+ years of experience',
    achievements: [
      { title: 'Gujarat State Cricket Championship Winner', year: 2020 },
      { title: 'Western India Football MVP Award', year: 2021 },
      { title: 'Gujarat Basketball Regional Champion', year: 2022 },
    ],
  });

  console.log('✅ Seeded player');
  return player;
}

async function seedManager(sports) {
  console.log('👔 Seeding manager...');
  
  const manager = await TeamManager.create({
    fullName: 'Krish Sanghani',
    email: 'krishsanghani@gmail.com',
    password: DEFAULT_PASSWORD,

    phone: '+91-98765-43211',
    city: 'Surat',
    isVerified: true,
    isActive: true,
    teams: [],
  });

  console.log('✅ Seeded manager');
  return manager;
}

async function seedOrganizer() {
  console.log('🏆 Seeding organizers...');
  
  // Authorized organizer
  const organizer = await TournamentOrganizer.create({
    fullName: 'Uday Odedara',
    email: 'udayodedara@gujaratsportsfederation.com',
    password: DEFAULT_PASSWORD,

    phone: '+91-98765-43212',
    city: 'Vadodara',
    isVerified: true,
    isActive: true,
    orgName: 'Gujarat Sports Federation',
    isVerifiedOrganizer: true,
    isAuthorized: true,
    authorizationRequestDate: new Date('2025-01-01'),
    authorizedAt: new Date('2025-01-05'),
  });

  // Unauthorized organizers (pending authorization)
  const unauthorizedOrganizers = [
    {
      fullName: 'Raj Malhotra',
      email: 'raj@maharashtracentral.com',
      password: DEFAULT_PASSWORD,
      phone: '+91-98765-43213',
      city: 'Pune',
      isVerified: true,
      isActive: true,
      orgName: 'Maharashtra Sports Central',
      isVerifiedOrganizer: true,
      isAuthorized: false,
      verificationDocumentUrl: 'https://res.cloudinary.com/dggwds1xm/image/upload/v1728734567/document1.pdf',
      authorizationRequestDate: new Date('2025-02-01'),
    },
    {
      fullName: 'Priya Sharma',
      email: 'priya@delhisports.com',
      password: DEFAULT_PASSWORD,
      phone: '+91-98765-43214',
      city: 'Delhi',
      isVerified: true,
      isActive: true,
      orgName: 'Delhi Sports Association',
      isVerifiedOrganizer: true,
      isAuthorized: false,
      verificationDocumentUrl: 'https://res.cloudinary.com/dggwds1xm/image/upload/v1728734568/document2.pdf',
      authorizationRequestDate: new Date('2025-02-02'),
    },
    {
      fullName: 'Vikram Patel',
      email: 'vikram@karnatasports.com',
      password: DEFAULT_PASSWORD,
      phone: '+91-98765-43215',
      city: 'Bangalore',
      isVerified: true,
      isActive: true,
      orgName: 'Karnataka Athletic Federation',
      isVerifiedOrganizer: true,
      isAuthorized: false,
      verificationDocumentUrl: 'https://res.cloudinary.com/dggwds1xm/image/upload/v1728734569/document3.pdf',
      authorizationRequestDate: new Date('2025-02-03'),
    },
  ];

  // Hash passwords before insertMany (insertMany doesn't trigger pre-save middleware)
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const unauthorizedOrganizersWithHash = unauthorizedOrganizers.map(org => ({
    ...org,
    password: hashedPassword,
  }));

  await TournamentOrganizer.insertMany(unauthorizedOrganizersWithHash);

  console.log('✅ Seeded 1 authorized + 3 unauthorized organizers');
  return organizer;
}

async function seedAdditionalPlayers(sports) {
  console.log('👥 Seeding additional players...');
  
  // Expanded player list - at least 15 players per sport for Cricket, Football, Hockey
  const playerTemplates = [
    // Cricket players (sport 0) - 25 players
    { name: 'Amit Kumar', sport: 0, role: 'Batsman', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Sneha Patel', sport: 0, role: 'Bowler', city: 'Rajkot', gender: 'Female' },
    { name: 'Kavita Shah', sport: 0, role: 'Wicketkeeper', city: 'Junagadh', gender: 'Female' },
    { name: 'Nikhil Trivedi', sport: 0, role: 'All-rounder', city: 'Mehsana', gender: 'Male' },
    { name: 'Neha Kapadia', sport: 0, role: 'Batsman', city: 'Palanpur', gender: 'Female' },
    { name: 'Dhruv Desai', sport: 0, role: 'Bowler', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Ravi Patel', sport: 0, role: 'All-rounder', city: 'Surat', gender: 'Male' },
    { name: 'Yash Mehta', sport: 0, role: 'Batsman', city: 'Vadodara', gender: 'Male' },
    { name: 'Krish Shah', sport: 0, role: 'Bowler', city: 'Rajkot', gender: 'Male' },
    { name: 'Aditya Singh', sport: 0, role: 'Wicketkeeper', city: 'Gandhinagar', gender: 'Male' },
    { name: 'Priya Joshi', sport: 0, role: 'All-rounder', city: 'Bhavnagar', gender: 'Female' },
    { name: 'Rahul Deshmukh', sport: 0, role: 'Batsman', city: 'Jamnagar', gender: 'Male' },
    { name: 'Manish Gupta', sport: 0, role: 'Bowler', city: 'Anand', gender: 'Male' },
    { name: 'Siddharth Rao', sport: 0, role: 'All-rounder', city: 'Nadiad', gender: 'Male' },
    { name: 'Deepak Modi', sport: 0, role: 'Batsman', city: 'Morbi', gender: 'Male' },
    { name: 'Swati Kulkarni', sport: 0, role: 'Bowler', city: 'Surendranagar', gender: 'Female' },
    { name: 'Tanvi Sharma', sport: 0, role: 'Wicketkeeper', city: 'Navsari', gender: 'Female' },
    { name: 'Kiran Dave', sport: 0, role: 'All-rounder', city: 'Valsad', gender: 'Male' },
    { name: 'Varun Thakur', sport: 0, role: 'Batsman', city: 'Bharuch', gender: 'Male' },
    { name: 'Ishaan Pandya', sport: 0, role: 'Bowler', city: 'Porbandar', gender: 'Male' },
    { name: 'Aryan Bhatt', sport: 0, role: 'All-rounder', city: 'Himmatnagar', gender: 'Male' },
    { name: 'Nisha Raval', sport: 0, role: 'Batsman', city: 'Ankleshwar', gender: 'Female' },
    { name: 'Rohan Vyas', sport: 0, role: 'Bowler', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Ajay Prajapati', sport: 0, role: 'Wicketkeeper', city: 'Surat', gender: 'Male' },
    { name: 'Divya Solanki', sport: 0, role: 'All-rounder', city: 'Vadodara', gender: 'Female' },
    { name: 'Minal Desai', sport: 0, role: 'Batsman', city: 'Junagadh', gender: 'Female' },
    { name: 'Ritu Bhatt', sport: 0, role: 'Bowler', city: 'Junagadh', gender: 'Female' },
    { name: 'Sarita Mehta', sport: 0, role: 'All-rounder', city: 'Rajkot', gender: 'Female' },
    { name: 'Geeta Pandya', sport: 0, role: 'Wicketkeeper', city: 'Junagadh', gender: 'Female' },
    { name: 'Anita Vyas', sport: 0, role: 'Batsman', city: 'Surat', gender: 'Female' },
    { name: 'Radha Modi', sport: 0, role: 'Bowler', city: 'Vadodara', gender: 'Female' },
    { name: 'Seema Joshi', sport: 0, role: 'All-rounder', city: 'Junagadh', gender: 'Female' },
    { name: 'Lata Shah', sport: 0, role: 'Batsman', city: 'Ahmedabad', gender: 'Female' },
    { name: 'Sunita Patel', sport: 0, role: 'Wicketkeeper', city: 'Rajkot', gender: 'Female' },
    { name: 'Usha Rao', sport: 0, role: 'Bowler', city: 'Gandhinagar', gender: 'Female' },
    
    // Football players (sport 1) - 25 players
    { name: 'Priyanka Sharma', sport: 1, role: 'Goalkeeper', city: 'Surat', gender: 'Female' },
    { name: 'Vikram Singh', sport: 1, role: 'Defender', city: 'Gandhinagar', gender: 'Male' },
    { name: 'Pooja Pandya', sport: 1, role: 'Midfielder', city: 'Nadiad', gender: 'Female' },
    { name: 'Ritu Thakkar', sport: 1, role: 'Striker', city: 'Navsari', gender: 'Female' },
    { name: 'Vishal Bhatt', sport: 1, role: 'Midfielder', city: 'Himmatnagar', gender: 'Male' },
    { name: 'Karan Joshi', sport: 1, role: 'Defender', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Ankit Yadav', sport: 1, role: 'Striker', city: 'Rajkot', gender: 'Male' },
    { name: 'Mihir Choudhary', sport: 1, role: 'Goalkeeper', city: 'Surat', gender: 'Male' },
    { name: 'Riya Kapoor', sport: 1, role: 'Defender', city: 'Vadodara', gender: 'Female' },
    { name: 'Sagar Panchal', sport: 1, role: 'Midfielder', city: 'Gandhinagar', gender: 'Male' },
    { name: 'Pratik Jain', sport: 1, role: 'Striker', city: 'Bhavnagar', gender: 'Male' },
    { name: 'Kajal Mishra', sport: 1, role: 'Defender', city: 'Jamnagar', gender: 'Female' },
    { name: 'Chirag Patel', sport: 1, role: 'Midfielder', city: 'Anand', gender: 'Male' },
    { name: 'Akash Nair', sport: 1, role: 'Striker', city: 'Morbi', gender: 'Male' },
    { name: 'Simran Kaur', sport: 1, role: 'Goalkeeper', city: 'Surendranagar', gender: 'Female' },
    { name: 'Jay Parekh', sport: 1, role: 'Defender', city: 'Navsari', gender: 'Male' },
    { name: 'Harsh Shah', sport: 1, role: 'Midfielder', city: 'Valsad', gender: 'Male' },
    { name: 'Tina Agarwal', sport: 1, role: 'Striker', city: 'Bharuch', gender: 'Female' },
    { name: 'Gaurav Kumar', sport: 1, role: 'Defender', city: 'Porbandar', gender: 'Male' },
    { name: 'Bhavesh Amin', sport: 1, role: 'Midfielder', city: 'Palanpur', gender: 'Male' },
    { name: 'Komal Vora', sport: 1, role: 'Striker', city: 'Ankleshwar', gender: 'Female' },
    { name: 'Mayur Trivedi', sport: 1, role: 'Goalkeeper', city: 'Junagadh', gender: 'Male' },
    { name: 'Parthiv Desai', sport: 1, role: 'Defender', city: 'Mehsana', gender: 'Male' },
    { name: 'Shraddha Joshi', sport: 1, role: 'Midfielder', city: 'Ahmedabad', gender: 'Female' },
    { name: 'Tushar Pandya', sport: 1, role: 'Striker', city: 'Surat', gender: 'Male' },
    { name: 'Aarti Mehta', sport: 1, role: 'Defender', city: 'Gandhinagar', gender: 'Female' },
    { name: 'Preeti Shah', sport: 1, role: 'Midfielder', city: 'Rajkot', gender: 'Female' },
    { name: 'Mamta Desai', sport: 1, role: 'Striker', city: 'Surat', gender: 'Female' },
    { name: 'Jyoti Patel', sport: 1, role: 'Goalkeeper', city: 'Vadodara', gender: 'Female' },
    { name: 'Rekha Joshi', sport: 1, role: 'Defender', city: 'Gandhinagar', gender: 'Female' },
    { name: 'Kaveri Rao', sport: 1, role: 'Midfielder', city: 'Ahmedabad', gender: 'Female' },
    { name: 'Anuja Vora', sport: 1, role: 'Striker', city: 'Rajkot', gender: 'Female' },
    { name: 'Malini Pandya', sport: 1, role: 'Defender', city: 'Surat', gender: 'Female' },
    { name: 'Dipika Modi', sport: 1, role: 'Midfielder', city: 'Gandhinagar', gender: 'Female' },
    { name: 'Hansa Bhatt', sport: 1, role: 'Goalkeeper', city: 'Vadodara', gender: 'Female' },
    
    // Basketball players (sport 2) - 20 players
    { name: 'Raj Mehta', sport: 2, role: 'Shooting Guard', city: 'Vadodara', gender: 'Male' },
    { name: 'Arjun Rao', sport: 2, role: 'Center', city: 'Jamnagar', gender: 'Male' },
    { name: 'Diya Modi', sport: 2, role: 'Small Forward', city: 'Surendranagar', gender: 'Female' },
    { name: 'Sanjay Amin', sport: 2, role: 'Power Forward', city: 'Porbandar', gender: 'Male' },
    { name: 'Veer Solanki', sport: 2, role: 'Point Guard', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Lakshmi Iyer', sport: 2, role: 'Shooting Guard', city: 'Rajkot', gender: 'Female' },
    { name: 'Parth Thakkar', sport: 2, role: 'Center', city: 'Surat', gender: 'Male' },
    { name: 'Riddhi Patel', sport: 2, role: 'Small Forward', city: 'Vadodara', gender: 'Female' },
    { name: 'Kunal Mehta', sport: 2, role: 'Power Forward', city: 'Gandhinagar', gender: 'Male' },
    { name: 'Isha Kapadia', sport: 2, role: 'Point Guard', city: 'Bhavnagar', gender: 'Female' },
    { name: 'Dev Chauhan', sport: 2, role: 'Shooting Guard', city: 'Anand', gender: 'Male' },
    { name: 'Palak Shah', sport: 2, role: 'Center', city: 'Nadiad', gender: 'Female' },
    { name: 'Yug Prajapati', sport: 2, role: 'Small Forward', city: 'Morbi', gender: 'Male' },
    { name: 'Navya Joshi', sport: 2, role: 'Power Forward', city: 'Navsari', gender: 'Female' },
    { name: 'Dhruvi Dave', sport: 2, role: 'Point Guard', city: 'Valsad', gender: 'Female' },
    { name: 'Meet Amin', sport: 2, role: 'Shooting Guard', city: 'Bharuch', gender: 'Male' },
    { name: 'Aditi Raval', sport: 2, role: 'Center', city: 'Palanpur', gender: 'Female' },
    { name: 'Smit Pandya', sport: 2, role: 'Small Forward', city: 'Ankleshwar', gender: 'Male' },
    { name: 'Mira Vyas', sport: 2, role: 'Power Forward', city: 'Junagadh', gender: 'Female' },
    { name: 'Rudra Modi', sport: 2, role: 'Point Guard', city: 'Mehsana', gender: 'Male' },
    { name: 'Neel Patel', sport: 2, role: 'Shooting Guard', city: 'Jamnagar', gender: 'Male' },
    { name: 'Abhay Desai', sport: 2, role: 'Center', city: 'Rajkot', gender: 'Male' },
    { name: 'Pranav Joshi', sport: 2, role: 'Power Forward', city: 'Surat', gender: 'Male' },
    { name: 'Roshan Shah', sport: 2, role: 'Small Forward', city: 'Gandhinagar', gender: 'Male' },
    { name: 'Sahil Vora', sport: 2, role: 'Point Guard', city: 'Bhavnagar', gender: 'Male' },
    { name: 'Kavita Desai', sport: 2, role: 'Shooting Guard', city: 'Vadodara', gender: 'Female' },
    { name: 'Shilpa Mehta', sport: 2, role: 'Center', city: 'Rajkot', gender: 'Female' },
    { name: 'Priti Joshi', sport: 2, role: 'Small Forward', city: 'Surat', gender: 'Female' },
    { name: 'Rina Shah', sport: 2, role: 'Power Forward', city: 'Vadodara', gender: 'Female' },
    { name: 'Meena Patel', sport: 2, role: 'Point Guard', city: 'Ahmedabad', gender: 'Female' },
    
    // Volleyball players (sport 3) - 15 players
    { name: 'Anjali Desai', sport: 3, role: 'Setter', city: 'Bhavnagar', gender: 'Female' },
    { name: 'Hardik Vora', sport: 3, role: 'Libero', city: 'Morbi', gender: 'Male' },
    { name: 'Meera Dave', sport: 3, role: 'Outside Hitter', city: 'Bharuch', gender: 'Female' },
    { name: 'Pranav Shah', sport: 3, role: 'Middle Blocker', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Aanya Patel', sport: 3, role: 'Opposite Hitter', city: 'Surat', gender: 'Female' },
    { name: 'Shiv Joshi', sport: 3, role: 'Setter', city: 'Vadodara', gender: 'Male' },
    { name: 'Roshni Mehta', sport: 3, role: 'Libero', city: 'Rajkot', gender: 'Female' },
    { name: 'Aryan Desai', sport: 3, role: 'Outside Hitter', city: 'Gandhinagar', gender: 'Male' },
    { name: 'Hiral Thakkar', sport: 3, role: 'Middle Blocker', city: 'Jamnagar', gender: 'Female' },
    { name: 'Nirmal Amin', sport: 3, role: 'Opposite Hitter', city: 'Anand', gender: 'Male' },
    { name: 'Khushi Pandya', sport: 3, role: 'Setter', city: 'Nadiad', gender: 'Female' },
    { name: 'Darshan Raval', sport: 3, role: 'Libero', city: 'Navsari', gender: 'Male' },
    { name: 'Aarohi Vyas', sport: 3, role: 'Outside Hitter', city: 'Valsad', gender: 'Female' },
    { name: 'Jatin Modi', sport: 3, role: 'Middle Blocker', city: 'Bharuch', gender: 'Male' },
    { name: 'Sia Kapadia', sport: 3, role: 'Opposite Hitter', city: 'Porbandar', gender: 'Female' },
    { name: 'Kaushal Desai', sport: 3, role: 'Setter', city: 'Bhavnagar', gender: 'Male' },
    { name: 'Suresh Mehta', sport: 3, role: 'Libero', city: 'Jamnagar', gender: 'Male' },
    { name: 'Ramesh Patel', sport: 3, role: 'Outside Hitter', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Dinesh Shah', sport: 3, role: 'Middle Blocker', city: 'Surat', gender: 'Male' },
    { name: 'Paresh Vora', sport: 3, role: 'Opposite Hitter', city: 'Vadodara', gender: 'Male' },
    { name: 'Rajni Desai', sport: 3, role: 'Setter', city: 'Morbi', gender: 'Female' },
    { name: 'Sheetal Joshi', sport: 3, role: 'Libero', city: 'Gandhinagar', gender: 'Female' },
    { name: 'Varsha Pandya', sport: 3, role: 'Outside Hitter', city: 'Rajkot', gender: 'Female' },
    { name: 'Archana Raval', sport: 3, role: 'Middle Blocker', city: 'Morbi', gender: 'Female' },
    { name: 'Bharti Modi', sport: 3, role: 'Opposite Hitter', city: 'Anand', gender: 'Female' },
    
    // Hockey players (sport 4) - 20 players
    { name: 'Rohit Joshi', sport: 4, role: 'Forward', city: 'Anand', gender: 'Male' },
    { name: 'Shruti Raval', sport: 4, role: 'Defender', city: 'Ankleshwar', gender: 'Female' },
    { name: 'Karan Parikh', sport: 4, role: 'Goalkeeper', city: 'Valsad', gender: 'Male' },
    { name: 'Vivek Sharma', sport: 4, role: 'Midfielder', city: 'Ahmedabad', gender: 'Male' },
    { name: 'Tanmay Patel', sport: 4, role: 'Forward', city: 'Surat', gender: 'Male' },
    { name: 'Kavya Shah', sport: 4, role: 'Defender', city: 'Vadodara', gender: 'Female' },
    { name: 'Hitesh Mehta', sport: 4, role: 'Midfielder', city: 'Rajkot', gender: 'Male' },
    { name: 'Snehal Joshi', sport: 4, role: 'Forward', city: 'Gandhinagar', gender: 'Female' },
    { name: 'Rajesh Desai', sport: 4, role: 'Goalkeeper', city: 'Bhavnagar', gender: 'Male' },
    { name: 'Nidhi Amin', sport: 4, role: 'Defender', city: 'Jamnagar', gender: 'Female' },
    { name: 'Ashwin Pandya', sport: 4, role: 'Midfielder', city: 'Morbi', gender: 'Male' },
    { name: 'Kriti Vora', sport: 4, role: 'Forward', city: 'Surendranagar', gender: 'Female' },
    { name: 'Hemant Raval', sport: 4, role: 'Defender', city: 'Navsari', gender: 'Male' },
    { name: 'Poornima Dave', sport: 4, role: 'Midfielder', city: 'Palanpur', gender: 'Female' },
    { name: 'Sameer Vyas', sport: 4, role: 'Forward', city: 'Junagadh', gender: 'Male' },
    { name: 'Jinal Modi', sport: 4, role: 'Goalkeeper', city: 'Mehsana', gender: 'Female' },
    { name: 'Chetan Kapadia', sport: 4, role: 'Defender', city: 'Ankleshwar', gender: 'Male' },
    { name: 'Urmila Solanki', sport: 4, role: 'Midfielder', city: 'Himmatnagar', gender: 'Female' },
    { name: 'Lalit Thakur', sport: 4, role: 'Forward', city: 'Porbandar', gender: 'Male' },
    { name: 'Megha Kulkarni', sport: 4, role: 'Defender', city: 'Bharuch', gender: 'Female' },
  ];

  const players = [];
  for (let i = 0; i < playerTemplates.length; i++) {
    const template = playerTemplates[i];
    const player = await Player.create({
      fullName: template.name,
      email: `${template.name.toLowerCase().replace(/ /g, '.')}@players.com`,
      password: DEFAULT_PASSWORD,
      role: 'Player',
      phone: `+91-${String(98760 + i).padStart(5, '9')}-${String(10000 + i * 100).padStart(5, '0')}`,
      city: template.city,
      isVerified: true,
      isActive: true,
      sports: [{ sport: sports[template.sport]._id, role: template.role }],
      gender: template.gender,
      dateOfBirth: new Date(1995 + (i % 10), (i % 12), (i % 28) + 1),
      height: 160 + (i % 30),
      weight: 60 + (i % 30),
    });
    players.push(player);
  }

  console.log(`✅ Seeded ${players.length} additional players`);
  return players;
}

async function seedTeams(manager, player, allPlayers, sports) {
  console.log('⚽ Seeding teams...');
  
  const teamTemplates = [
    { name: 'Ahmedabad Lions', sport: 0, gender: 'Male', city: 'Ahmedabad' },
    { name: 'Surat Strikers', sport: 1, gender: 'Male', city: 'Surat' },
    { name: 'Vadodara Warriors', sport: 2, gender: 'Female', city: 'Vadodara' },
    { name: 'Rajkot Royals', sport: 0, gender: 'Mixed', city: 'Rajkot' },
    { name: 'Gandhinagar Giants', sport: 1, gender: 'Female', city: 'Gandhinagar' },
    { name: 'Bhavnagar Blazers', sport: 3, gender: 'Male', city: 'Bhavnagar' },
    { name: 'Jamnagar Jaguars', sport: 2, gender: 'Male', city: 'Jamnagar' },
    { name: 'Junagadh Thunder', sport: 0, gender: 'Female', city: 'Junagadh' },
    { name: 'Anand Eagles', sport: 4, gender: 'Mixed', city: 'Anand' },
    { name: 'Nadiad Ninjas', sport: 1, gender: 'Male', city: 'Nadiad' },
    { name: 'Morbi Mavericks', sport: 3, gender: 'Female', city: 'Morbi' },
    { name: 'Mehsana Challengers', sport: 2, gender: 'Mixed', city: 'Mehsana' },
  ];

  const teams = [];
  
  for (let i = 0; i < teamTemplates.length; i++) {
    const template = teamTemplates[i];
    
    // Get all players who play this sport and match gender (or team is Mixed)
    const availablePlayers = allPlayers.filter(p => {
      const playsThisSport = p.sports.some(s => s.sport.toString() === sports[template.sport]._id.toString());
      const genderMatch = template.gender === 'Mixed' || p.gender === template.gender;
      return playsThisSport && genderMatch;
    });
    
    // Assign at least 15 players per team (11 playing + 4 substitutes)
    const teamPlayers = [];
    const playerCount = Math.min(15, availablePlayers.length);
    
    for (let j = 0; j < playerCount; j++) {
      if (availablePlayers[j]) {
        teamPlayers.push(availablePlayers[j]._id);
      }
    }
    
    // Add main player if they play this sport and match gender
    const mainPlayerPlaysThisSport = player.sports.some(s => s.sport.toString() === sports[template.sport]._id.toString());
    const mainPlayerGenderMatch = template.gender === 'Mixed' || player.gender === template.gender;
    if (mainPlayerPlaysThisSport && mainPlayerGenderMatch && i === 0) {
      teamPlayers.unshift(player._id); // Add to first team only
    }

    const team = await Team.create({
      name: template.name,
      sport: sports[template.sport]._id,
      manager: manager._id,
      city: template.city,
      gender: template.gender,
      description: `Professional ${sports[template.sport].name} team representing ${template.city}, Gujarat`,
      openToJoin: i % 3 === 0, // Every third team is open to join
      players: teamPlayers,
      achievements: [
        { title: `${template.city} District Championship`, year: 2023 },
        { title: 'Gujarat State Cup Winner', year: 2024 },
      ],
    });

    teams.push(team);
    console.log(`  ✓ ${template.name}: ${teamPlayers.length} players assigned`);
  }

  // Update manager's teams
  await TeamManager.findByIdAndUpdate(manager._id, {
    teams: teams.map(t => t._id),
  });

  console.log(`✅ Seeded ${teams.length} teams`);
  return teams;
}

async function seedTournaments(organizer, teams, sports) {
  console.log('🏆 Seeding tournaments...');
  
  const now = new Date();
  const tournamentTemplates = [
    { 
      name: 'Gujarat Premier Cricket League 2026', 
      sport: 0, 
      format: 'Knockout',
      teamLimit: 16,
      entryFee: 5000,
      prizePool: 100000,
      status: 'Upcoming',
      daysUntilStart: 30,
    },
    { 
      name: 'Ahmedabad Football Championship 2026', 
      sport: 1, 
      format: 'League',
      teamLimit: 20,
      entryFee: 7000,
      prizePool: 150000,
      status: 'Live',
      daysUntilStart: -5,
    },
    { 
      name: 'Surat Basketball Cup 2026', 
      sport: 2, 
      format: 'Knockout',
      teamLimit: 12,
      entryFee: 4000,
      prizePool: 80000,
      status: 'Upcoming',
      daysUntilStart: 15,
    },
    { 
      name: 'Vadodara Volleyball League 2026', 
      sport: 3, 
      format: 'League',
      teamLimit: 10,
      entryFee: 3000,
      prizePool: 60000,
      status: 'Upcoming',
      daysUntilStart: 20,
    },
    { 
      name: 'Gujarat Cricket Masters 2025', 
      sport: 0, 
      format: 'Knockout',
      teamLimit: 8,
      entryFee: 6000,
      prizePool: 120000,
      status: 'Completed',
      daysUntilStart: -60,
    },
    { 
      name: 'Rajkot City Football League 2026', 
      sport: 1, 
      format: 'League',
      teamLimit: 14,
      entryFee: 5500,
      prizePool: 110000,
      status: 'Upcoming',
      daysUntilStart: 45,
    },
    { 
      name: 'Gandhinagar Basketball Tournament', 
      sport: 2, 
      format: 'Knockout',
      teamLimit: 16,
      entryFee: 4500,
      prizePool: 90000,
      status: 'Live',
      daysUntilStart: -2,
    },
    { 
      name: 'Gujarat Hockey Champions Cup 2026', 
      sport: 4, 
      format: 'League',
      teamLimit: 12,
      entryFee: 5000,
      prizePool: 100000,
      status: 'Upcoming',
      daysUntilStart: 25,
    },
    { 
      name: 'Bhavnagar Summer Cricket Series 2026', 
      sport: 0, 
      format: 'League',
      teamLimit: 10,
      entryFee: 4000,
      prizePool: 75000,
      status: 'Upcoming',
      daysUntilStart: 40,
    },
    { 
      name: 'Jamnagar Winter Football Classic 2025', 
      sport: 1, 
      format: 'Knockout',
      teamLimit: 8,
      entryFee: 6500,
      prizePool: 130000,
      status: 'Completed',
      daysUntilStart: -90,
    },
    { 
      name: 'Anand Volleyball Super League 2026', 
      sport: 3, 
      format: 'League',
      teamLimit: 12,
      entryFee: 3500,
      prizePool: 70000,
      status: 'Upcoming',
      daysUntilStart: 35,
    },
    { 
      name: 'Mehsana Spring Basketball Tournament', 
      sport: 2, 
      format: 'Knockout',
      teamLimit: 10,
      entryFee: 4200,
      prizePool: 85000,
      status: 'Upcoming',
      daysUntilStart: 50,
    },
  ];

  const tournaments = [];
  for (let i = 0; i < tournamentTemplates.length; i++) {
    const template = tournamentTemplates[i];
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + template.daysUntilStart);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 15);
    
    const regStart = new Date(startDate);
    regStart.setDate(regStart.getDate() - 30);
    
    const regEnd = new Date(startDate);
    regEnd.setDate(regEnd.getDate() - 7);

    // Get teams for this sport
    const sportTeams = teams.filter(t => t.sport.toString() === sports[template.sport]._id.toString());
    const registeredTeams = sportTeams.slice(0, Math.min(template.teamLimit, sportTeams.length));
    const approvedTeams = registeredTeams; // All registered teams are auto-approved

    const tournament = await Tournament.create({
      name: template.name,
      sport: sports[template.sport]._id,
      organizer: organizer._id,
      format: template.format,
      registrationType: sports[template.sport].teamBased ? 'Team' : 'Player',
      teamLimit: template.teamLimit,
      playersPerTeam: 11,
      description: `${template.format} style ${sports[template.sport].name} tournament featuring top Gujarat teams`,
      registrationStart: regStart,
      registrationEnd: regEnd,
      startDate: startDate,
      endDate: endDate,
      entryFee: template.entryFee,
      prizePool: template.prizePool,
      ground: {
        name: `${template.name.split(' ')[0]} Stadium`,
        city: organizer.city,
        address: `SG Highway, ${organizer.city}, Gujarat`,
      },
      rules: [
        'All participants must arrive 30 minutes before match time',
        'Proper sports attire is mandatory',
        'Teams must have minimum required players',
        'Follow referee decisions',
        'Maintain sportsmanship at all times',
      ],
      registeredTeams: registeredTeams.map(t => t._id),
      approvedTeams: approvedTeams.map(t => t._id),
      platformFee: 500,
      platformFeePaid: i % 3 !== 0, // 2/3 tournaments have paid platform fee
      isPublished: i % 3 !== 0,
    });

    tournaments.push(tournament);
  }

  console.log(`✅ Seeded ${tournaments.length} tournaments`);
  return tournaments;
}

async function seedMatches(tournaments, sports) {
  console.log('⚡ Seeding matches...');
  
  const matches = [];
  
  // Create matches for tournaments with approved teams
  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    
    if (tournament.approvedTeams.length < 2) continue;
    
    const numMatches = Math.min(10, Math.floor(tournament.approvedTeams.length / 2) * 3);
    
    for (let j = 0; j < numMatches; j++) {
      const teamAIndex = j % tournament.approvedTeams.length;
      const teamBIndex = (j + 1) % tournament.approvedTeams.length;
      
      if (teamAIndex === teamBIndex) continue;
      
      const matchDate = new Date(tournament.startDate);
      matchDate.setDate(matchDate.getDate() + j);
      
      const match = await Match.create({
        tournament: tournament._id,
        sport: tournament.sport,
        teamA: tournament.approvedTeams[teamAIndex],
        teamB: tournament.approvedTeams[teamBIndex],
        scheduledAt: matchDate,
        ground: {
          name: tournament.ground.name,
          city: tournament.ground.city,
          address: tournament.ground.address,
        },
      });
      
      matches.push(match);
    }
  }

  console.log(`✅ Seeded ${matches.length} matches`);
  return matches;
}

async function seedPayments(tournaments, player, manager, organizer, additionalPlayers, teams) {
  console.log('💳 Seeding payments...');
  
  const payments = [];
  const statuses = ['Success', 'Success', 'Success', 'Pending', 'Failed']; // 60% success, 20% pending, 20% failed

  // 1. Platform fee payments from organizer (₹500 each)
  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    const status = i % 3 !== 0 ? 'Success' : 'Pending';
    
    const platformFeePayment = await Payment.create({
      tournament: tournament._id,
      organizer: tournament.organizer,
      payerType: 'Organizer',
      amount: 500,
      status,
      provider: status === 'Success' ? 'razorpay' : null,
      providerPaymentId: status === 'Success' ? `platform_${tournament._id}_${Date.now() + i}` : null,
    });
    
    payments.push(platformFeePayment);
  }
  
  // 2. Player registration payments — spread across players and tournaments
  const allPlayers = [player, ...(additionalPlayers || [])];
  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    // 2-3 players register per tournament
    const numPlayerPayments = Math.min(3, allPlayers.length);
    for (let j = 0; j < numPlayerPayments; j++) {
      const currentPlayer = allPlayers[(i + j) % allPlayers.length];
      const status = statuses[(i + j) % statuses.length];
      
      const payment = await Payment.create({
        player: currentPlayer._id,
        payerType: 'Player',
        tournament: tournament._id,
        organizer: tournament.organizer,
        amount: tournament.entryFee,
        status,
        provider: status !== 'Pending' ? 'razorpay' : null,
        providerPaymentId: status !== 'Pending' ? `player_pay_${Date.now()}_${i}_${j}` : null,
      });
      
      payments.push(payment);
    }
  }

  // 3. Team registration payments — use actual registered teams
  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    if (!tournament.registeredTeams || tournament.registeredTeams.length === 0) continue;
    
    // Up to 2 team payments per tournament
    const numTeamPayments = Math.min(2, tournament.registeredTeams.length);
    for (let j = 0; j < numTeamPayments; j++) {
      const status = statuses[(i + j + 1) % statuses.length];
      
      const payment = await Payment.create({
        team: tournament.registeredTeams[j],
        payerType: 'Team',
        tournament: tournament._id,
        organizer: tournament.organizer,
        amount: tournament.entryFee,
        status,
        provider: status !== 'Pending' ? 'razorpay' : null,
        providerPaymentId: status !== 'Pending' ? `team_pay_${Date.now()}_${i}_${j}` : null,
      });
      
      payments.push(payment);
    }
  }

  // Log breakdown
  const orgCount = payments.filter(p => p.payerType === 'Organizer').length;
  const playerCount = payments.filter(p => p.payerType === 'Player').length;
  const teamCount = payments.filter(p => p.payerType === 'Team').length;
  const successCount = payments.filter(p => p.status === 'Success').length;
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const failedCount = payments.filter(p => p.status === 'Failed').length;
  console.log(`✅ Seeded ${payments.length} payments (Organizer: ${orgCount}, Player: ${playerCount}, Team: ${teamCount})`);
  console.log(`   Status breakdown — Success: ${successCount}, Pending: ${pendingCount}, Failed: ${failedCount}`);
  return payments;
}

async function seedRequests(player, manager, teams, tournaments) {
  console.log('📋 Seeding requests...');
  
  const requests = [];
  
  // Player requests to join a team
  for (let i = 0; i < Math.min(10, teams.length); i++) {
    const team = teams[i];
    
    const request = await Request.create({
      requestType: 'PLAYER_TO_TEAM',
      sender: player._id,
      receiver: manager._id,
      team: team._id, // The team player wants to join
      status: i % 3 === 0 ? 'PENDING' : (i % 3 === 1 ? 'ACCEPTED' : 'REJECTED'),
    });
    
    requests.push(request);
  }

  // Team invitations to player (player receives request from team)
  for (let i = 0; i < Math.min(10, teams.length); i++) {
    const team = teams[i];
    
    const request = await Request.create({
      requestType: 'TEAM_TO_PLAYER',
      sender: manager._id, // Manager sends on behalf of team
      receiver: player._id,
      team: team._id, // The team inviting the player
      status: i % 3 === 0 ? 'PENDING' : (i % 3 === 1 ? 'ACCEPTED' : 'REJECTED'),
    });
    
    requests.push(request);
  }

  console.log(`✅ Seeded ${requests.length} requests`);
  return requests;
}

async function seedBookings(tournaments, organizer) {
  console.log('📅 Seeding bookings...');
  
  const bookings = [];
  
  for (let i = 0; i < Math.min(10, tournaments.length); i++) {
    const tournament = tournaments[i];
    
    // Skip if no registered teams
    if (tournament.registeredTeams.length === 0) continue;
    
    const booking = await Booking.create({
      bookingId: `BK${Date.now()}${i}`,
      user: organizer._id,
      tournament: tournament._id,
      team: tournament.registeredTeams[0],
      registrationType: tournament.registrationType,
      amount: tournament.entryFee,
      status: i % 4 === 0 ? 'Pending' : (i % 4 === 1 ? 'Confirmed' : 'Cancelled'),
    });
    
    bookings.push(booking);
  }

  console.log(`✅ Seeded ${bookings.length} bookings`);
  return bookings;
}

async function seedOrganizerRequests(organizer, admin) {
  console.log('🔐 Seeding organizer authorization requests...');
  
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const requests = [];
  
  const gujaratCities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 
                         'Jamnagar', 'Junagadh', 'Anand', 'Nadiad', 'Morbi', 'Mehsana'];
  
  // Create 10+ pending organizer authorization requests
  for (let i = 0; i < 12; i++) {
    const pendingOrganizer = await TournamentOrganizer.create({
      fullName: `${['Rajesh', 'Vikas', 'Mahesh', 'Suresh', 'Ramesh', 'Dinesh', 'Nilesh', 'Hitesh', 'Prakash', 'Jayesh', 'Deepak', 'Ashok'][i]} ${['Patel', 'Shah', 'Desai', 'Modi', 'Joshi', 'Mehta', 'Trivedi', 'Pandya', 'Amin', 'Vora', 'Raval', 'Thakkar'][i]}`,
      email: `organizer${i + 2}@gujarat.com`,
      password: DEFAULT_PASSWORD,
      role: 'TournamentOrganizer',
      phone: `+91-${String(98750 + i).padStart(5, '9')}-${String(30000 + i * 100).padStart(5, '0')}`,
      city: gujaratCities[i],
      isVerified: true,
      isActive: true,
      orgName: `${gujaratCities[i]} Sports Association`,
      isVerifiedOrganizer: false,
      isAuthorized: false,
      authorizationRequestDate: new Date(),
    });
    
    requests.push(pendingOrganizer);
  }

  console.log(`✅ Seeded ${requests.length} organizer authorization requests`);
  return requests;
}

async function seedFeedbacks(player, manager, organizer, additionalPlayers) {
  console.log('💬 Seeding feedbacks...');

  const feedbackData = [
    { user: player._id, rating: 5, comment: 'Amazing platform! Made it so easy to find and join tournaments in Gujarat. The registration process is seamless.' },
    { user: player._id, rating: 4, comment: 'Great experience overall. Love the match fixtures feature. Would be nice to have live score updates too.' },
    { user: manager._id, rating: 5, comment: 'Managing my team has never been easier. The player invitation system works flawlessly. Highly recommended!' },
    { user: manager._id, rating: 4, comment: 'Very useful for organizing team rosters. The dashboard gives a clear overview of all team activities.' },
    { user: organizer._id, rating: 5, comment: 'Best tournament management platform I have used. Creating fixtures and managing registrations is a breeze.' },
    { user: organizer._id, rating: 4, comment: 'The payment integration for platform fees is very smooth. Would love to see more analytics for tournaments.' },
    { user: additionalPlayers[0]._id, rating: 5, comment: 'Found some great cricket tournaments in Ahmedabad through this platform. The UI is clean and intuitive.' },
    { user: additionalPlayers[1]._id, rating: 3, comment: 'Decent platform. Sometimes the search could be more responsive, but overall it gets the job done.' },
    { user: additionalPlayers[2]._id, rating: 5, comment: 'Love how easy it is to browse tournaments by sport. Joined a football league and had a fantastic experience!' },
    { user: additionalPlayers[3]._id, rating: 4, comment: 'Good platform for connecting with local sports communities. The team detail pages are very informative.' },
    { user: additionalPlayers[4]._id, rating: 5, comment: 'SportsHub is a game changer for amateur players like me. Finally a proper platform to find competitive matches!' },
    { user: additionalPlayers[5]._id, rating: 4, comment: 'Really enjoying the platform. The notification system keeps me updated about my team requests and match schedules.' },
    { user: additionalPlayers[6]._id, rating: 3, comment: 'Nice concept and execution. A mobile app would make it even better for on-the-go access.' },
    { user: additionalPlayers[7]._id, rating: 5, comment: 'Excellent platform for sports enthusiasts in Gujarat. The tournament bracket system is very well designed.' },
    { user: additionalPlayers[8]._id, rating: 4, comment: 'Very professional platform. Helped our badminton club organize inter-city tournaments effortlessly.' },
    { user: additionalPlayers[9]._id, rating: 5, comment: 'Absolutely love it! The fact that it supports both team and individual sports is brilliant. Keep up the great work!' },
  ];

  const feedbacks = await Feedback.insertMany(feedbackData);
  console.log(`✅ Seeded ${feedbacks.length} feedbacks`);
  return feedbacks;
}

async function seed() {
  try {
    await connectDB();
    await clearDatabase();

    // Seed in order due to dependencies
    const sports = await seedSports();
    const admin = await seedAdmin();
    const player = await seedPlayer(sports);
    const manager = await seedManager(sports);
    const organizer = await seedOrganizer();
    const additionalPlayers = await seedAdditionalPlayers(sports);
    const teams = await seedTeams(manager, player, additionalPlayers, sports);
    const tournaments = await seedTournaments(organizer, teams, sports);
    const matches = await seedMatches(tournaments, sports);
    const payments = await seedPayments(tournaments, player, manager, organizer, additionalPlayers, teams);
    const requests = await seedRequests(player, manager, teams, tournaments);
    const bookings = await seedBookings(tournaments, organizer);
    const authRequests = await seedOrganizerRequests(organizer, admin);
    const feedbacks = await seedFeedbacks(player, manager, organizer, additionalPlayers);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Sports: ${sports.length}`);
    console.log(`- Users: 1 admin, 1 player, 1 manager, 1 organizer, ${additionalPlayers.length} additional players, ${authRequests.length} pending organizers`);
    console.log(`- Teams: ${teams.length}`);
    console.log(`- Tournaments: ${tournaments.length}`);
    console.log(`- Matches: ${matches.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Requests: ${requests.length}`);
    console.log(`- Bookings: ${bookings.length}`);
    console.log(`- Feedbacks: ${feedbacks.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@gmail.com / Password123!');
    console.log('Player: rajnasit@gmail.com / Password123!');
    console.log('Manager: krishsanghani@gmail.com / Password123!');
    console.log('Organizer: udayodedara@gujaratsportsfederation.com / Password123!');
    
    console.log('\n📍 All data is for Gujarat, India');
    console.log('Cities: Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, and more Gujarat cities');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
