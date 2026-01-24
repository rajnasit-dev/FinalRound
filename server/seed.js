import 'dotenv/config';
import mongoose from 'mongoose';
import { Sport } from './src/models/Sport.model.js';
import { User } from './src/models/User.model.js';
import { Admin } from './src/models/Admin.model.js';
import { Player } from './src/models/Player.model.js';
import { TeamManager } from './src/models/TeamManager.model.js';
import { TournamentOrganizer } from './src/models/TournamentOrganizer.model.js';
import { Team } from './src/models/Team.model.js';
import { Tournament } from './src/models/Tournament.model.js';
import { Match } from './src/models/Match.model.js';
import { Payment } from './src/models/Payment.model.js';
import { Feedback } from './src/models/Feedback.model.js';
import { Request } from './src/models/Request.model.js';
import Booking from './src/models/Booking.model.js';

// Helper function to generate date of birth from age
const getDOBFromAge = (age) => {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  // Set birthday to be sometime in the past year (random month and day)
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Use 1-28 to avoid invalid dates
  return new Date(birthYear, month, day);
};

const sports = [
  {
    name: "Cricket",
    teamBased: true,
    minPlayers: 11,
    maxPlayers: 11,
    roles: ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper", "Captain"],
    isActive: true
  },
  {
    name: "Football",
    teamBased: true,
    minPlayers: 11,
    maxPlayers: 11,
    roles: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger", "Captain"],
    isActive: true
  },
  {
    name: "Basketball",
    teamBased: true,
    minPlayers: 5,
    maxPlayers: 5,
    roles: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center", "Captain"],
    isActive: true
  },
  {
    name: "Volleyball",
    teamBased: true,
    minPlayers: 6,
    maxPlayers: 6,
    roles: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero", "Captain"],
    isActive: true
  },
  {
    name: "Tennis",
    teamBased: false,
    minPlayers: 1,
    maxPlayers: 2,
    roles: ["Singles Player", "Doubles Player"],
    isActive: true
  },
  {
    name: "Badminton",
    teamBased: false,
    minPlayers: 1,
    maxPlayers: 2,
    roles: ["Singles Player", "Doubles Player"],
    isActive: true
  },
  {
    name: "Table Tennis",
    teamBased: false,
    minPlayers: 1,
    maxPlayers: 2,
    roles: ["Singles Player", "Doubles Player"],
    isActive: true
  },
  {
    name: "Kabaddi",
    teamBased: true,
    minPlayers: 7,
    maxPlayers: 7,
    roles: ["Raider", "Defender", "All-Rounder", "Captain"],
    isActive: true
  },
  {
    name: "Hockey",
    teamBased: true,
    minPlayers: 11,
    maxPlayers: 11,
    roles: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Captain"],
    isActive: true
  },
  {
    name: "Chess",
    teamBased: false,
    minPlayers: 1,
    maxPlayers: 1,
    roles: ["Player"],
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Sport.deleteMany({});
    await Team.deleteMany({});
    await Tournament.deleteMany({});
    await Match.deleteMany({});
    await Payment.deleteMany({});
    await Feedback.deleteMany({});
    await Request.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ========== SEED SPORTS ==========
    const createdSports = await Sport.insertMany(sports);
    console.log(`✅ Created ${createdSports.length} sports`);

    // Get sport IDs for reference
    const cricket = createdSports.find(s => s.name === "Cricket");
    const football = createdSports.find(s => s.name === "Football");
    const basketball = createdSports.find(s => s.name === "Basketball");
    const volleyball = createdSports.find(s => s.name === "Volleyball");
    const tennis = createdSports.find(s => s.name === "Tennis");
    const badminton = createdSports.find(s => s.name === "Badminton");
    const hockey = createdSports.find(s => s.name === "Hockey");
    const chess = createdSports.find(s => s.name === "Chess");

    // ========== SEED USERS ==========
    // Admin User - seeded to database
    const admin = await Admin.create({
      fullName: "Admin User",
      email: "admin@gmail.com",
      password: "Admin123!",
      phone: "+91-9999999999",
      city: "Ahmedabad",
      isVerified: true,
      isActive: true,
      avatar: "https://randomuser.me/api/portraits/men/99.jpg",
      permissions: [
        "manage_users",
        "manage_organizers",
        "manage_tournaments",
        "manage_teams",
        "manage_matches",
        "manage_payments",
        "view_analytics",
        "manage_sports",
      ]
    });
    console.log(`✅ Created 1 admin user (admin@gmail.com / Admin123!)`);

    // Tournament Organizers
    const organizers = await TournamentOrganizer.create([
      // Test Organizer
      {
        fullName: "Test Organizer",
        email: "testorganizer@gmail.com",
        password: "Password123!",
        phone: "+91-9876543200",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        orgName: "Test Organization",
        isVerifiedOrganizer: true,
        isAuthorized: true,
        avatar: "https://randomuser.me/api/portraits/men/100.jpg"
      },
      {
        fullName: "Gujarat Sports Authority",
        email: "gujaratsports2025@gmail.com",
        password: "Password123!",
        phone: "+91-9876543210",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        orgName: "Gujarat Sports Authority",
        isVerifiedOrganizer: true,
        isAuthorized: true,
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        fullName: "Ketan Mehta",
        email: "ketanmehta789@gmail.com",
        password: "Password123!",
        phone: "+91-9876543211",
        city: "Surat",
        isVerified: true,
        isActive: true,
        orgName: "Gujarat Sports Federation",
        isVerifiedOrganizer: true,
        isAuthorized: true,
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      {
        fullName: "Priti Shah",
        email: "pritishah456@gmail.com",
        password: "Password123!",
        phone: "+91-9876543212",
        city: "Vadodara",
        isVerified: true,
        isActive: true,
        orgName: "Baroda Sports Complex",
        isVerifiedOrganizer: true,
        isAuthorized: true,
        avatar: "https://randomuser.me/api/portraits/women/1.jpg"
      },
      {
        fullName: "Ketan Patel",
        email: "ketanpatel321@gmail.com",
        password: "Password123!",
        phone: "+91-9876543213",
        city: "Rajkot",
        isVerified: true,
        isActive: true,
        orgName: "Rajkot Sports Council",
        isVerifiedOrganizer: true,
        isAuthorized: true,
        avatar: "https://randomuser.me/api/portraits/men/3.jpg"
      },
      // Pending authorization requests
      {
        fullName: "Rajesh Kumar Sports Inc",
        email: "rajeshkumar@sportsinc.com",
        password: "Password123!",
        phone: "+91-9876543214",
        city: "Mumbai",
        isVerified: true,
        isActive: true,
        orgName: "Mumbai Sports Center",
        isVerifiedOrganizer: false,
        isAuthorized: false,
        authorizationRequestDate: new Date(),
        verificationDocumentUrl: "https://example.com/docs/rajesh-verification.pdf",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg"
      },
      {
        fullName: "Sneha Reddy Events",
        email: "sneha@reddyevents.com",
        password: "Password123!",
        phone: "+91-9876543215",
        city: "Bangalore",
        isVerified: true,
        isActive: true,
        orgName: "Reddy Sports Events",
        isVerifiedOrganizer: false,
        isAuthorized: false,
        authorizationRequestDate: new Date(Date.now() - 86400000), // 1 day ago
        verificationDocumentUrl: "https://example.com/docs/sneha-verification.pdf",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg"
      },
      {
        fullName: "Vikram Singh Tournament Co",
        email: "vikram@tournamentco.in",
        password: "Password123!",
        phone: "+91-9876543216",
        city: "Delhi",
        isVerified: true,
        isActive: true,
        orgName: "Delhi Sports Hub",
        isVerifiedOrganizer: false,
        isAuthorized: false,
        authorizationRequestDate: new Date(Date.now() - 172800000), // 2 days ago
        verificationDocumentUrl: "https://example.com/docs/vikram-verification.pdf",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg"
      }
    ]);
    console.log(`✅ Created ${organizers.length} tournament organizers (${organizers.filter(o => !o.isAuthorized).length} pending authorization)`);

    // Team Managers with detailed profiles
    const managers = await TeamManager.create([
      // Test Manager
      {
        fullName: "Test Manager",
        email: "testmanager@gmail.com",
        password: "Password123!",
        phone: "+91-9876543202",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/men/101.jpg",
        achievements: {
          title: "Test Account for Development",
          year: 2026
        }
      },
      {
        fullName: "Aryan Sharma",
        email: "aryansharma890@gmail.com",
        password: "Password123!",
        phone: "+91-9876543220",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/men/10.jpg",
        achievements: {
          title: "Best Cricket Team Manager Award - Gujarat State Championship",
          year: 2024
        }
      },
      {
        fullName: "Priya Patel",
        email: "priyapatel567@gmail.com",
        password: "Password123!",
        phone: "+91-9876543221",
        city: "Surat",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/women/10.jpg",
        achievements: {
          title: "Football Team Excellence Award - Surat Sports Federation",
          year: 2023
        }
      },
      {
        fullName: "Amit Desai",
        email: "amitdesai234@gmail.com",
        password: "Password123!",
        phone: "+91-9876543222",
        city: "Vadodara",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/men/11.jpg",
        achievements: {
          title: "Basketball Team of the Year - Vadodara District",
          year: 2024
        }
      },
      {
        fullName: "Sneha Shah",
        email: "snehashah789@gmail.com",
        password: "Password123!",
        phone: "+91-9876543223",
        city: "Rajkot",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/women/11.jpg",
        achievements: {
          title: "Outstanding Team Management - Rajkot Sports Council",
          year: 2025
        }
      },
      {
        fullName: "Vikram Modi",
        email: "vikrammodi456@gmail.com",
        password: "Password123!",
        phone: "+91-9876543224",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/men/12.jpg",
        achievements: {
          title: "Volleyball Team Championship Winner - Gujarat State",
          year: 2023
        }
      },
      {
        fullName: "Disha Thakkar",
        email: "dishathakkar123@gmail.com",
        password: "Password123!",
        phone: "+91-9876543225",
        city: "Gandhinagar",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
        achievements: {
          title: "Best Sports Team Developer Award - Gandhinagar Municipality",
          year: 2024
        }
      },
      {
        fullName: "Rahul Joshi",
        email: "rahuljoshi345@gmail.com",
        password: "Password123!",
        phone: "+91-9876543226",
        city: "Bhavnagar",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/men/13.jpg",
        achievements: {
          title: "Kabaddi Team Excellence Award - Regional Championship",
          year: 2024
        }
      },
      {
        fullName: "Neha Vora",
        email: "nehavora678@gmail.com",
        password: "Password123!",
        phone: "+91-9876543227",
        city: "Jamnagar",
        isVerified: true,
        isActive: true,
        avatar: "https://randomuser.me/api/portraits/women/13.jpg",
        achievements: {
          title: "Hockey Team Best Performance - Western Zone",
          year: 2025
        }
      }
    ]);
    console.log(`✅ Created ${managers.length} team managers`);

    // Players
    const players = await Player.create([
      // Test Player
      {
        fullName: "Test Player",
        email: "testplayer@gmail.com",
        password: "Password123!",
        phone: "+91-9876543201",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: cricket._id, role: "All-rounder" },
          { sport: football._id, role: "Midfielder" }
        ],
        achievements: [
          { title: "Test Account for Development", year: 2026 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(25),
        height: 175,
        weight: 70,
        bio: "Test player account for application testing",
        avatar: "https://randomuser.me/api/portraits/men/99.jpg"
      },
      // Cricket Players
      {
        fullName: "Harshil Patel",
        email: "harshilpatel527@gmail.com",
        password: "Password123!",
        phone: "+91-9876543230",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: cricket._id, role: "All-rounder" },
          { sport: football._id, role: "Midfielder" }
        ],
        achievements: [
          { title: "Man of the Tournament - Gujarat T20 League", year: 2023 },
          { title: "State Football Cup - Best Playmaker", year: 2024 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(25),
        height: 175,
        weight: 70,
        bio: "Dynamic all-rounder with explosive batting",
        avatar: "https://randomuser.me/api/portraits/men/20.jpg"
      },
      {
        fullName: "Karan Shah",
        email: "karanshah890@gmail.com",
        password: "Password123!",
        phone: "+91-9876543231",
        city: "Rajkot",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: cricket._id, role: "All-rounder" },
          { sport: basketball._id, role: "Guard" }
        ],
        achievements: [
          { title: "West Zone All-Rounder Award", year: 2024 },
          { title: "Intercity Hoops Defensive Leader", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(27),
        height: 173,
        weight: 68,
        bio: "Brilliant fielder and handy all-rounder",
        avatar: "https://randomuser.me/api/portraits/men/21.jpg"
      },
      {
        fullName: "Dhruv Modi",
        email: "dhruvmodi456@gmail.com",
        password: "Password123!",
        phone: "+91-9876543232",
        city: "Anand",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: cricket._id, role: "Bowler" },
          { sport: volleyball._id, role: "Middle Blocker" }
        ],
        achievements: [
          { title: "Best Spinner - State Championship", year: 2024 },
          { title: "Volleyball Blocker of the Year", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(26),
        height: 180,
        weight: 74,
        bio: "Accurate left-arm spinner",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      {
        fullName: "Priya Desai",
        email: "priyadesai789@gmail.com",
        password: "Password123!",
        phone: "+91-9876543233",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: cricket._id, role: "Batsman" },
          { sport: tennis._id, role: "Singles Player" }
        ],
        achievements: [
          { title: "Women's Premier Opener of the Season", year: 2025 },
          { title: "State Tennis Quarterfinalist", year: 2023 }
        ],
        gender: "Female",
        dateOfBirth: getDOBFromAge(24),
        height: 165,
        weight: 58,
        bio: "Elegant left-handed opener",
        avatar: "https://randomuser.me/api/portraits/women/20.jpg"
      },
      {
        fullName: "Nirav Mehta",
        email: "niravmehta234@gmail.com",
        password: "Password123!",
        phone: "+91-9876543234",
        city: "Surat",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: cricket._id, role: "All-rounder" },
          { sport: hockey._id, role: "Forward" }
        ],
        achievements: [
          { title: "Player of the Series - Ranji Regional", year: 2023 },
          { title: "Hockey Western Zone Top Scorer", year: 2024 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(28),
        height: 178,
        weight: 75,
        bio: "Dynamic all-rounder and left-arm spinner",
        avatar: "https://randomuser.me/api/portraits/men/23.jpg"
      },
      // Football Players
      {
        fullName: "Arjun Thakkar",
        email: "arjunthakkar567@gmail.com",
        password: "Password123!",
        phone: "+91-9876543235",
        city: "Vadodara",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: football._id, role: "Striker" },
          { sport: cricket._id, role: "Batsman" }
        ],
        achievements: [
          { title: "Golden Boot - Gujarat Super League", year: 2024 },
          { title: "District T20 Clean Hitter Award", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(26),
        height: 172,
        weight: 67,
        bio: "Prolific goal scorer",
        avatar: "https://randomuser.me/api/portraits/men/24.jpg"
      },
      {
        fullName: "Vishal Pandya",
        email: "vishalpandya890@gmail.com",
        password: "Password123!",
        phone: "+91-9876543236",
        city: "Surat",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: football._id, role: "Defender" },
          { sport: basketball._id, role: "Forward" }
        ],
        achievements: [
          { title: "Best Defender - State League", year: 2025 },
          { title: "All-India College Hoops MVP", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(27),
        height: 188,
        weight: 85,
        bio: "Strong and reliable defender",
        avatar: "https://randomuser.me/api/portraits/men/25.jpg"
      },
      {
        fullName: "Parth Joshi",
        email: "parthjoshi321@gmail.com",
        password: "Password123!",
        phone: "+91-9876543237",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: football._id, role: "Goalkeeper" },
          { sport: badminton._id, role: "Singles Player" }
        ],
        achievements: [
          { title: "Golden Gloves - City League", year: 2024 },
          { title: "State Badminton Quarterfinalist", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(28),
        height: 191,
        weight: 82,
        bio: "Safe hands and great reflexes",
        avatar: "https://randomuser.me/api/portraits/men/26.jpg"
      },
      {
        fullName: "Yash Shah",
        email: "yashshah654@gmail.com",
        password: "Password123!",
        phone: "+91-9876543238",
        city: "Rajkot",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: football._id, role: "Midfielder" },
          { sport: cricket._id, role: "Wicket Keeper" }
        ],
        achievements: [
          { title: "Assist Leader - Rajkot Premier League", year: 2025 },
          { title: "Best Gloves - District T20", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(25),
        height: 170,
        weight: 65,
        bio: "Speedy winger",
        avatar: "https://randomuser.me/api/portraits/men/27.jpg"
      },
      {
        fullName: "Ronak Mehta",
        email: "ronakmehta789@gmail.com",
        password: "Password123!",
        phone: "+91-9876543239",
        city: "Surat",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: football._id, role: "Midfielder" },
          { sport: volleyball._id, role: "Setter" }
        ],
        achievements: [
          { title: "Creative Midfield Maestro - City Cup", year: 2024 },
          { title: "Setter of the Tournament - State Volleyball", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(24),
        height: 168,
        weight: 62,
        bio: "Creative midfielder",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg"
      },
      // Basketball Players
      {
        fullName: "Harsh Patel",
        email: "harshpatel456@gmail.com",
        password: "Password123!",
        phone: "+91-9876543240",
        city: "Vadodara",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: basketball._id, role: "Forward" },
          { sport: football._id, role: "Defender" }
        ],
        achievements: [
          { title: "Basketball State Finals MVP", year: 2024 },
          { title: "Fair Play Defender - City League", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(26),
        height: 201,
        weight: 95,
        bio: "Powerful forward",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg"
      },
      {
        fullName: "Jay Thakkar",
        email: "jaythakkar321@gmail.com",
        password: "Password123!",
        phone: "+91-9876543241",
        city: "Ahmedabad",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: basketball._id, role: "Guard" },
          { sport: cricket._id, role: "Batsman" }
        ],
        achievements: [
          { title: "Clutch Guard Award - Hoops League", year: 2025 },
          { title: "City T20 Power Hitter", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(25),
        height: 193,
        weight: 88,
        bio: "Skilled guard",
        avatar: "https://randomuser.me/api/portraits/men/30.jpg"
      },
      {
        fullName: "Darshan Shah",
        email: "darshanshah987@gmail.com",
        password: "Password123!",
        phone: "+91-9876543242",
        city: "Rajkot",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: basketball._id, role: "Center" },
          { sport: football._id, role: "Defender" }
        ],
        achievements: [
          { title: "Defensive Anchor - State Hoops", year: 2024 },
          { title: "Clean Sheet Leader - District League", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(23),
        height: 206,
        weight: 100,
        bio: "Dominant center",
        avatar: "https://randomuser.me/api/portraits/men/31.jpg"
      },
      {
        fullName: "Meet Modi",
        email: "meetmodi654@gmail.com",
        password: "Password123!",
        phone: "+91-9876543243",
        city: "Gandhinagar",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: basketball._id, role: "Guard" },
          { sport: volleyball._id, role: "Libero" }
        ],
        achievements: [
          { title: "Sixth Man of the Year - City League", year: 2024 },
          { title: "Best Libero - University Nationals", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(24),
        height: 188,
        weight: 85,
        bio: "Quick guard",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        fullName: "Dev Desai",
        email: "devdesai321@gmail.com",
        password: "Password123!",
        phone: "+91-9876543244",
        city: "Surat",
        isVerified: true,
        isActive: true,
        sports: [
          { sport: basketball._id, role: "Forward" },
          { sport: tennis._id, role: "Singles Player" }
        ],
        achievements: [
          { title: "Versatile Forward - State Super League", year: 2025 },
          { title: "District Tennis Champion", year: 2023 }
        ],
        gender: "Male",
        dateOfBirth: getDOBFromAge(25),
        height: 198,
        weight: 92,
        bio: "Versatile forward",
        avatar: "https://randomuser.me/api/portraits/men/33.jpg"
      }
    ]);
    console.log(`✅ Created ${players.length} players`);

    // ========== SEED TEAMS ==========
    const teams = await Team.create([
      // Cricket Teams
      {
        name: "Gujarat Warriors",
        sport: cricket._id,
        manager: managers[0]._id,
        captain: players[0]._id,
        players: [players[0]._id, players[1]._id, players[2]._id, players[3]._id, players[4]._id],
        city: "Ahmedabad",
        description: "Premier cricket team from Ahmedabad with a legacy of excellence",
        logoUrl: "https://img.icons8.com/color/96/cricket.png",
        achievements: [
          { title: "Ranji Trophy Qualifiers", year: 2024 },
          { title: "West Zone Champions", year: 2023 },
          { title: "State Super League Finalists", year: 2022 }
        ],
        openToJoin: false,
        isActive: true
      },
      {
        name: "Surat Strikers",
        sport: cricket._id,
        manager: managers[1]._id,
        captain: players[1]._id,
        players: [players[1]._id, players[2]._id, players[3]._id, players[4]._id],
        city: "Surat",
        description: "Surat's premier cricket team known for aggressive batting",
        logoUrl: "https://img.icons8.com/color/96/cricket-ball.png",
        achievements: [
          { title: "Coastal Cup Winners", year: 2024 },
          { title: "City T20 Champions", year: 2023 }
        ],
        openToJoin: true,
        isActive: true
      },
      {
        name: "Rajkot Royals",
        sport: cricket._id,
        manager: managers[3]._id,
        captain: players[2]._id,
        players: [players[2]._id, players[3]._id, players[4]._id],
        city: "Rajkot",
        description: "Cricket champions from Rajkot focusing on all-round performance",
        logoUrl: "https://img.icons8.com/fluency/96/cricket.png",
        achievements: [
          { title: "Rajkot Premier League Winners", year: 2024 },
          { title: "Inter-District Cup Finalists", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      // Football Teams
      {
        name: "Ahmedabad FC",
        sport: football._id,
        manager: managers[1]._id,
        captain: players[5]._id,
        players: [players[5]._id, players[6]._id, players[7]._id, players[8]._id, players[9]._id],
        city: "Ahmedabad",
        description: "Ahmedabad's professional football club with modern playing style",
        logoUrl: "https://img.icons8.com/color/96/football.png",
        achievements: [
          { title: "League Shield Winners", year: 2024 },
          { title: "Super Cup Finalists", year: 2023 }
        ],
        openToJoin: false,
        isActive: true
      },
      {
        name: "Baroda United",
        sport: football._id,
        manager: managers[2]._id,
        captain: players[6]._id,
        players: [players[6]._id, players[7]._id, players[8]._id, players[9]._id],
        city: "Vadodara",
        description: "Vadodara's united football team with strong defensive lineup",
        logoUrl: "https://img.icons8.com/fluency/96/football2.png",
        achievements: [
          { title: "Defenders Cup Winners", year: 2024 },
          { title: "Vadodara City League Champions", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      {
        name: "Surat Scorchers",
        sport: football._id,
        manager: managers[4]._id,
        captain: players[7]._id,
        players: [players[7]._id, players[8]._id, players[9]._id],
        city: "Surat",
        description: "Dynamic football team from Surat specializing in counter-attacks",
        logoUrl: "https://img.icons8.com/emoji/96/soccer-ball-emoji.png",
        achievements: [
          { title: "Counter Attack Masters", year: 2023 },
          { title: "Surat Invitational Winners", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      // Basketball Teams
      {
        name: "Rajkot Riders",
        sport: basketball._id,
        manager: managers[2]._id,
        captain: players[10]._id,
        players: [players[10]._id, players[11]._id, players[12]._id, players[13]._id, players[14]._id],
        city: "Rajkot",
        description: "Elite basketball team from Rajkot with fast-paced gameplay",
        logoUrl: "https://img.icons8.com/color/96/basketball.png",
        achievements: [
          { title: "Rajkot Slam Champions", year: 2024 },
          { title: "Fast Break Cup Winners", year: 2023 }
        ],
        openToJoin: false,
        isActive: true
      },
      {
        name: "Gandhinagar Giants",
        sport: basketball._id,
        manager: managers[3]._id,
        captain: players[11]._id,
        players: [players[11]._id, players[12]._id, players[13]._id, players[14]._id],
        city: "Gandhinagar",
        description: "Gandhinagar's premier basketball squad focusing on teamwork",
        logoUrl: "https://img.icons8.com/fluency/96/basketball.png",
        achievements: [
          { title: "Teamwork Trophy Winners", year: 2023 },
          { title: "Capital City League Champions", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      {
        name: "Ahmedabad Aces",
        sport: basketball._id,
        manager: managers[5]._id,
        captain: players[12]._id,
        players: [players[12]._id, players[13]._id, players[14]._id],
        city: "Ahmedabad",
        description: "Top-tier basketball team from Ahmedabad",
        logoUrl: "https://img.icons8.com/emoji/96/basketball-emoji.png",
        achievements: [
          { title: "Aces Invitational Winners", year: 2024 },
          { title: "City Hoops Finalists", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      // Volleyball Teams
      {
        name: "Vadodara Volley Kings",
        sport: volleyball._id,
        manager: managers[4]._id,
        captain: players[5]._id,
        players: [players[5]._id, players[6]._id, players[7]._id, players[8]._id],
        city: "Vadodara",
        description: "Dominant volleyball team from Vadodara known for spike attacks",
        logoUrl: "https://img.icons8.com/color/96/volleyball.png",
        achievements: [
          { title: "Spike Masters", year: 2024 },
          { title: "Western Circuit Champions", year: 2023 }
        ],
        openToJoin: true,
        isActive: true
      },
      {
        name: "Gandhinagar Spikers",
        sport: volleyball._id,
        manager: managers[5]._id,
        captain: players[6]._id,
        players: [players[6]._id, players[7]._id, players[8]._id],
        city: "Gandhinagar",
        description: "Professional volleyball team with excellent blocking skills",
        logoUrl: "https://img.icons8.com/fluency/96/volleyball.png",
        achievements: [
          { title: "Block Wall Award", year: 2023 },
          { title: "Capital Cup Finalists", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      // Kabaddi Teams
      {
        name: "Bhavnagar Bulls",
        sport: createdSports.find(s => s.name === "Kabaddi")._id,
        manager: managers[6]._id,
        captain: players[0]._id,
        players: [players[0]._id, players[1]._id, players[2]._id, players[3]._id],
        city: "Bhavnagar",
        description: "Fierce kabaddi team from Bhavnagar with strong raiders",
        logoUrl: "https://img.icons8.com/color/96/kabaddi.png",
        achievements: [
          { title: "Raiders Cup Winners", year: 2024 },
          { title: "State Kabaddi Finalists", year: 2023 }
        ],
        openToJoin: true,
        isActive: true
      },
      {
        name: "Rajkot Raiders",
        sport: createdSports.find(s => s.name === "Kabaddi")._id,
        manager: managers[3]._id,
        captain: players[1]._id,
        players: [players[1]._id, players[2]._id, players[3]._id],
        city: "Rajkot",
        description: "Kabaddi champions from Rajkot specializing in defensive tactics",
        logoUrl: "https://img.icons8.com/fluency/96/sport.png",
        achievements: [
          { title: "Defense Wall Champions", year: 2023 },
          { title: "Rajkot Pro Kabaddi Finalists", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      },
      // Hockey Teams
      {
        name: "Jamnagar Hawks",
        sport: createdSports.find(s => s.name === "Hockey")._id,
        manager: managers[7]._id,
        captain: players[5]._id,
        players: [players[5]._id, players[6]._id, players[7]._id, players[8]._id, players[9]._id],
        city: "Jamnagar",
        description: "Elite hockey team from Jamnagar with precision passing",
        logoUrl: "https://img.icons8.com/color/96/hockey.png",
        achievements: [
          { title: "Stick Masters Cup", year: 2024 },
          { title: "Coastal Hockey League Winners", year: 2023 }
        ],
        openToJoin: false,
        isActive: true
      },
      {
        name: "Ahmedabad Strikers Hockey",
        sport: createdSports.find(s => s.name === "Hockey")._id,
        manager: managers[0]._id,
        captain: players[6]._id,
        players: [players[6]._id, players[7]._id, players[8]._id, players[9]._id],
        city: "Ahmedabad",
        description: "Premier hockey team from Ahmedabad known for aggressive play",
        logoUrl: "https://img.icons8.com/fluency/96/hockey.png",
        achievements: [
          { title: "Ahmedabad Open Winners", year: 2024 },
          { title: "Offense Blitz Trophy", year: 2022 }
        ],
        openToJoin: true,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${teams.length} teams`);

    // ========== SEED TOURNAMENTS ==========
    const now = new Date();
    const tournaments = await Tournament.create([
      // LIVE TOURNAMENTS - Team Based
      {
        name: "Gujarat Premier Cricket League LIVE",
        sport: cricket._id,
        organizer: organizers[0]._id,
        format: "League",
        description: "Live cricket championship currently underway",
        teamLimit: 8,
        playersPerTeam: 15,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        entryFee: 50000,
        prizePool: 1000000,
        rules: ["ICC regulations apply", "Each team must have 11 players", "No substitutions during play"],
        ground: {
          name: "Narendra Modi Stadium",
          city: "Ahmedabad",
          address: "Sardar Patel Stadium, Motera, Ahmedabad, Gujarat 380005"
        },
        status: "Live",
        registeredTeams: [teams[0]._id, teams[1]._id],
        approvedTeams: [teams[0]._id, teams[1]._id]
      },
      {
        name: "All Gujarat Football Championship LIVE",
        sport: football._id,
        organizer: organizers[1]._id,
        format: "Knockout",
        description: "Live football tournament happening now",
        teamLimit: 16,
        playersPerTeam: 18,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        entryFee: 30000,
        prizePool: 500000,
        rules: ["FIFA regulations apply", "11 players per side", "Substitutions allowed"],
        ground: {
          name: "EKA Arena",
          city: "Ahmedabad",
          address: "EKA Arena, Tragad, Ahmedabad, Gujarat 382421"
        },
        status: "Live",
        registeredTeams: [teams[2]._id, teams[3]._id],
        approvedTeams: [teams[2]._id, teams[3]._id]
      },
      // LIVE TOURNAMENTS - Individual
      {
        name: "Gujarat State Tennis Open LIVE",
        sport: tennis._id,
        organizer: organizers[2]._id,
        format: "Knockout",
        description: "Live tennis singles championship",
        teamLimit: 32,
        playersPerTeam: 1,
        registrationType: "Player",
        registrationStart: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        entryFee: 2000,
        prizePool: 200000,
        rules: ["ITF rules apply", "Best of 3 sets", "Singles format"],
        ground: {
          name: "Ahmedabad Racquet Club",
          city: "Ahmedabad",
          address: "Satellite, Ahmedabad, Gujarat 380015"
        },
        status: "Live",
        registeredTeams: [],
        approvedTeams: []
      },
      // UPCOMING TOURNAMENTS - Team Based
      {
        name: "Gujarat Inter-City Cricket Cup 2026",
        sport: cricket._id,
        organizer: organizers[0]._id,
        format: "League",
        description: "Upcoming cricket championship featuring teams from all Gujarat cities",
        teamLimit: 8,
        playersPerTeam: 15,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        entryFee: 50000,
        prizePool: 800000,
        rules: ["ICC regulations apply", "Each team must have 11 players", "No substitutions during play"],
        ground: {
          name: "Saurashtra Cricket Association Stadium",
          city: "Rajkot",
          address: "Khandheri Road, Rajkot, Gujarat 360005"
        },
        status: "Upcoming",
        registeredTeams: [teams[0]._id, teams[1]._id],
        approvedTeams: [teams[0]._id, teams[1]._id]
      },
      {
        name: "Surat Football League 2026",
        sport: football._id,
        organizer: organizers[1]._id,
        format: "League",
        description: "Upcoming professional football league in Surat",
        teamLimit: 12,
        playersPerTeam: 18,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000),
        entryFee: 35000,
        prizePool: 600000,
        rules: ["FIFA regulations apply", "11 players per side", "Substitutions allowed"],
        ground: {
          name: "Lalubhai Nayakwadi Stadium",
          city: "Surat",
          address: "Chowk Bazar, Surat, Gujarat 395003"
        },
        status: "Upcoming",
        registeredTeams: [teams[2]._id],
        approvedTeams: [teams[2]._id]
      },
      {
        name: "Rajkot Basketball Championship 2026",
        sport: basketball._id,
        organizer: organizers[2]._id,
        format: "Knockout",
        description: "Upcoming basketball tournament in Rajkot",
        teamLimit: 10,
        playersPerTeam: 12,
        registrationType: "Team",
        registrationStart: new Date(now.getTime()),
        registrationEnd: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
        entryFee: 40000,
        prizePool: 500000,
        rules: ["FIBA rules apply", "5 players on court", "4 quarters of 10 minutes each"],
        ground: {
          name: "Rajkot Sports Complex",
          city: "Rajkot",
          address: "University Road, Rajkot, Gujarat 360005"
        },
        status: "Upcoming",
        registeredTeams: [teams[4]._id, teams[5]._id],
        approvedTeams: [teams[4]._id]
      },
      {
        name: "Gujarat Volleyball Cup 2026",
        sport: volleyball._id,
        organizer: organizers[3]._id,
        format: "Round Robin",
        description: "State level volleyball championship",
        teamLimit: 8,
        playersPerTeam: 10,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000),
        entryFee: 25000,
        prizePool: 400000,
        rules: ["FIVB rules apply", "6 players on court", "Best of 5 sets"],
        ground: {
          name: "Vadodara Sports Arena",
          city: "Vadodara",
          address: "Alkapuri, Vadodara, Gujarat 390007"
        },
        status: "Upcoming",
        registeredTeams: [],
        approvedTeams: []
      },
      // UPCOMING TOURNAMENTS - Individual
      {
        name: "Ahmedabad Badminton Masters 2026",
        sport: badminton._id,
        organizer: organizers[0]._id,
        format: "Knockout",
        description: "Elite badminton singles tournament",
        teamLimit: 64,
        playersPerTeam: 1,
        registrationType: "Player",
        registrationStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000),
        entryFee: 1500,
        prizePool: 250000,
        rules: ["BWF rules apply", "Singles format", "Best of 3 games"],
        ground: {
          name: "Ahmedabad Indoor Sports Complex",
          city: "Ahmedabad",
          address: "Maninagar, Ahmedabad, Gujarat 380008"
        },
        status: "Upcoming",
        registeredTeams: [],
        approvedTeams: []
      },
      {
        name: "Gujarat State Chess Championship 2026",
        sport: chess._id,
        organizer: organizers[1]._id,
        format: "Round Robin",
        description: "State level chess championship with rapid and blitz formats",
        teamLimit: 20,
        playersPerTeam: 1,
        registrationType: "Player",
        registrationStart: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        entryFee: 1000,
        prizePool: 100000,
        rules: ["FIDE rules apply", "Rapid time control: 15+10", "Swiss system"],
        ground: {
          name: "Rajkot Chess Academy",
          city: "Rajkot",
          address: "Kalawad Road, Rajkot, Gujarat 360005"
        },
        status: "Upcoming",
        registeredTeams: [],
        approvedTeams: []
      },
      // COMPLETED TOURNAMENTS - Team Based
      {
        name: "Gujarat Premier Cricket League 2025",
        sport: cricket._id,
        organizer: organizers[0]._id,
        format: "League",
        description: "Completed cricket championship 2025",
        teamLimit: 8,
        playersPerTeam: 15,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        entryFee: 45000,
        prizePool: 800000,
        rules: ["ICC regulations apply", "Each team must have 11 players"],
        ground: {
          name: "Narendra Modi Stadium",
          city: "Ahmedabad",
          address: "Sardar Patel Stadium, Motera, Ahmedabad, Gujarat 380005"
        },
        status: "Completed",
        registeredTeams: [teams[0]._id, teams[1]._id],
        approvedTeams: [teams[0]._id, teams[1]._id]
      },
      {
        name: "Surat Football Cup 2025",
        sport: football._id,
        organizer: organizers[1]._id,
        format: "Knockout",
        description: "Completed football championship",
        teamLimit: 12,
        playersPerTeam: 18,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 140 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        entryFee: 30000,
        prizePool: 500000,
        rules: ["FIFA regulations apply", "11 players per side"],
        ground: {
          name: "Lalubhai Nayakwadi Stadium",
          city: "Surat",
          address: "Chowk Bazar, Surat, Gujarat 395003"
        },
        status: "Completed",
        registeredTeams: [teams[2]._id, teams[3]._id],
        approvedTeams: [teams[2]._id, teams[3]._id]
      },
      {
        name: "Rajkot Basketball League 2025",
        sport: basketball._id,
        organizer: organizers[2]._id,
        format: "League",
        description: "Completed basketball tournament",
        teamLimit: 8,
        playersPerTeam: 12,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        entryFee: 35000,
        prizePool: 400000,
        rules: ["FIBA rules apply", "5 players on court"],
        ground: {
          name: "Rajkot Sports Complex",
          city: "Rajkot",
          address: "University Road, Rajkot, Gujarat 360005"
        },
        status: "Completed",
        registeredTeams: [teams[4]._id, teams[5]._id],
        approvedTeams: [teams[4]._id, teams[5]._id]
      },
      // COMPLETED TOURNAMENTS - Individual
      {
        name: "Gujarat Tennis Open 2025",
        sport: tennis._id,
        organizer: organizers[3]._id,
        format: "Knockout",
        description: "Completed tennis singles championship",
        teamLimit: 32,
        playersPerTeam: 1,
        registrationType: "Player",
        registrationStart: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 68 * 24 * 60 * 60 * 1000),
        entryFee: 1800,
        prizePool: 180000,
        rules: ["ITF rules apply", "Best of 3 sets"],
        ground: {
          name: "Ahmedabad Racquet Club",
          city: "Ahmedabad",
          address: "Satellite, Ahmedabad, Gujarat 380015"
        },
        status: "Completed",
        registeredTeams: [],
        approvedTeams: []
      },
      {
        name: "All Gujarat Badminton Championship 2025",
        sport: badminton._id,
        organizer: organizers[0]._id,
        format: "League",
        description: "Completed state badminton tournament",
        teamLimit: 48,
        playersPerTeam: 1,
        registrationType: "Player",
        registrationStart: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000),
        entryFee: 1200,
        prizePool: 150000,
        rules: ["BWF rules apply", "Singles format"],
        ground: {
          name: "Ahmedabad Indoor Sports Complex",
          city: "Ahmedabad",
          address: "Maninagar, Ahmedabad, Gujarat 380008"
        },
        status: "Completed",
        registeredTeams: [],
        approvedTeams: []
      },
      // CANCELLED TOURNAMENTS - Team Based
      {
        name: "Vadodara Cricket Premier League 2026",
        sport: cricket._id,
        organizer: organizers[2]._id,
        format: "League",
        description: "Cancelled due to venue issues",
        teamLimit: 8,
        playersPerTeam: 15,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        entryFee: 40000,
        prizePool: 600000,
        rules: ["ICC regulations apply"],
        ground: {
          name: "Moti Bagh Stadium",
          city: "Vadodara",
          address: "Moti Bagh, Vadodara, Gujarat 390001"
        },
        status: "Cancelled",
        registeredTeams: [teams[0]._id],
        approvedTeams: []
      },
      {
        name: "Gujarat State Football Cup 2026",
        sport: football._id,
        organizer: organizers[1]._id,
        format: "Knockout",
        description: "Cancelled due to insufficient registrations",
        teamLimit: 16,
        playersPerTeam: 18,
        registrationType: "Team",
        registrationStart: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        entryFee: 28000,
        prizePool: 450000,
        rules: ["FIFA regulations apply"],
        ground: {
          name: "TransStadia Arena",
          city: "Ahmedabad",
          address: "Bhat, Ahmedabad, Gujarat 382428"
        },
        status: "Cancelled",
        registeredTeams: [],
        approvedTeams: []
      },
      // CANCELLED TOURNAMENTS - Individual
      {
        name: "Surat Tennis Masters 2026",
        sport: tennis._id,
        organizer: organizers[0]._id,
        format: "Knockout",
        description: "Cancelled due to weather conditions",
        teamLimit: 24,
        playersPerTeam: 1,
        registrationType: "Player",
        registrationStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        startDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        entryFee: 1500,
        prizePool: 120000,
        rules: ["ITF rules apply"],
        ground: {
          name: "Surat Racquet Club",
          city: "Surat",
          address: "Vesu, Surat, Gujarat 395007"
        },
        status: "Cancelled",
        registeredTeams: [],
        approvedTeams: []
      }
    ]);
    console.log(`✅ Created ${tournaments.length} tournaments`);

    // ========== SEED MATCHES ==========
    const matches = await Match.create([
      // Live Matches
      {
        tournament: tournaments[0]._id,
        sport: cricket._id,
        ground: {
          name: "Narendra Modi Stadium",
          city: "Ahmedabad",
          address: "Sardar Patel Stadium, Motera, Ahmedabad, Gujarat 380005"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        status: "Live",
        teamAScore: 145,
        teamBScore: 98,
        scoreA: "145/3 (15.2 overs)",
        scoreB: "98/5 (12 overs)",
        resultText: "Match in progress"
      },
      {
        tournament: tournaments[1]._id,
        sport: football._id,
        ground: {
          name: "EKA Arena",
          city: "Ahmedabad",
          address: "EKA Arena, Tragad, Ahmedabad, Gujarat 382421"
        },
        teamA: teams[2]._id,
        teamB: teams[3]._id,
        scheduledAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        status: "Live",
        teamAScore: 2,
        teamBScore: 1,
        scoreA: "2 goals",
        scoreB: "1 goal",
        resultText: "2nd Half - 65'"
      },
      // Scheduled Upcoming Matches
      {
        tournament: tournaments[0]._id,
        sport: cricket._id,
        ground: {
          name: "Narendra Modi Stadium",
          city: "Ahmedabad",
          address: "Sardar Patel Stadium, Motera, Ahmedabad, Gujarat 380005"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[0]._id,
        sport: cricket._id,
        ground: {
          name: "Saurashtra Cricket Association Stadium",
          city: "Rajkot",
          address: "Khandheri Road, Rajkot, Gujarat 360005"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[0]._id,
        sport: cricket._id,
        ground: {
          name: "Narendra Modi Stadium",
          city: "Ahmedabad",
          address: "Sardar Patel Stadium, Motera, Ahmedabad, Gujarat 380005"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[1]._id,
        sport: football._id,
        ground: {
          name: "TransStadia Arena",
          city: "Ahmedabad",
          address: "Bhat, Ahmedabad, Gujarat 382428"
        },
        teamA: teams[2]._id,
        teamB: teams[3]._id,
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[1]._id,
        sport: football._id,
        ground: {
          name: "EKA Arena",
          city: "Ahmedabad",
          address: "EKA Arena, Tragad, Ahmedabad, Gujarat 382421"
        },
        teamA: teams[2]._id,
        teamB: teams[3]._id,
        scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[1]._id,
        sport: football._id,
        ground: {
          name: "Rajkot Municipal Corporation Stadium",
          city: "Rajkot",
          address: "Race Course Ring Road, Rajkot, Gujarat 360001"
        },
        teamA: teams[2]._id,
        teamB: teams[3]._id,
        scheduledAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[2]._id,
        sport: basketball._id,
        ground: {
          name: "Ahmedabad Indoor Sports Complex",
          city: "Ahmedabad",
          address: "Maninagar, Ahmedabad, Gujarat 380008"
        },
        teamA: teams[4]._id,
        teamB: teams[5]._id,
        scheduledAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[2]._id,
        sport: basketball._id,
        ground: {
          name: "Rajkot Sports Complex",
          city: "Rajkot",
          address: "University Road, Rajkot, Gujarat 360005"
        },
        teamA: teams[4]._id,
        teamB: teams[5]._id,
        scheduledAt: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      {
        tournament: tournaments[2]._id,
        sport: basketball._id,
        ground: {
          name: "Vadodara Sports Arena",
          city: "Vadodara",
          address: "Alkapuri, Vadodara, Gujarat 390007"
        },
        teamA: teams[4]._id,
        teamB: teams[5]._id,
        scheduledAt: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
        status: "Scheduled"
      },
      // Completed Matches with scores
      {
        tournament: tournaments[3]._id,
        sport: cricket._id,
        ground: {
          name: "Narendra Modi Stadium",
          city: "Ahmedabad",
          address: "Sardar Patel Stadium, Motera, Ahmedabad, Gujarat 380005"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        status: "Completed",
        teamAScore: 185,
        teamBScore: 178,
        scoreA: "185/7 (20 overs)",
        scoreB: "178/9 (20 overs)",
        resultText: "Team Gujarat Warriors won by 7 runs",
        manOfTheMatch: players[0]._id
      },
      {
        tournament: tournaments[3]._id,
        sport: cricket._id,
        ground: {
          name: "Saurashtra Cricket Association Stadium",
          city: "Rajkot",
          address: "Khandheri Road, Rajkot, Gujarat 360005"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        status: "Completed",
        teamAScore: 210,
        teamBScore: 195,
        scoreA: "210/5 (20 overs)",
        scoreB: "195/8 (20 overs)",
        resultText: "Team Gujarat Warriors won by 15 runs",
        manOfTheMatch: players[1]._id
      },
      {
        tournament: tournaments[3]._id,
        sport: cricket._id,
        ground: {
          name: "Moti Bagh Stadium",
          city: "Vadodara",
          address: "Moti Bagh, Vadodara, Gujarat 390001"
        },
        teamA: teams[0]._id,
        teamB: teams[1]._id,
        scheduledAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: "Completed",
        teamAScore: 175,
        teamBScore: 180,
        scoreA: "175/9 (20 overs)",
        scoreB: "180/6 (19.3 overs)",
        resultText: "Team Surat Strikers won by 4 wickets",
        manOfTheMatch: players[2]._id
      }
    ]);
    console.log(`✅ Created ${matches.length} matches`);

    // ========== SEED PAYMENTS ==========
    const payments = await Payment.create([
      {
        tournament: tournaments[0]._id,
        team: teams[0]._id,
        payerType: "Team",
        organizer: organizers[0]._id,
        amount: 50000,
        currency: "INR",
        status: "Success",
        provider: "Razorpay",
        transactionId: "pay_" + Math.random().toString(36).substr(2, 9)
      },
      {
        tournament: tournaments[0]._id,
        team: teams[1]._id,
        payerType: "Team",
        organizer: organizers[0]._id,
        amount: 50000,
        currency: "INR",
        status: "Success",
        provider: "Razorpay",
        transactionId: "pay_" + Math.random().toString(36).substr(2, 9)
      },
      {
        tournament: tournaments[1]._id,
        team: teams[2]._id,
        payerType: "Team",
        organizer: organizers[1]._id,
        amount: 30000,
        currency: "INR",
        status: "Success",
        provider: "Razorpay",
        transactionId: "pay_" + Math.random().toString(36).substr(2, 9)
      },
      {
        tournament: tournaments[1]._id,
        team: teams[3]._id,
        payerType: "Team",
        organizer: organizers[1]._id,
        amount: 30000,
        currency: "INR",
        status: "Pending",
        provider: "Razorpay"
      }
    ]);
    console.log(`✅ Created ${payments.length} payments`);

    // ========== SEED FEEDBACK (Website Reviews) ==========
    const feedbacks = await Feedback.create([
      {
        user: players[0]._id,
        rating: 5,
        comment: "Amazing platform! Makes organizing and joining tournaments so easy. The interface is intuitive and the features are exactly what we needed."
      },
      {
        user: players[1]._id,
        rating: 4,
        comment: "Great experience using SportsHub. Love how I can track all my matches and tournaments in one place. Highly recommend!"
      },
      {
        user: managers[0]._id,
        rating: 5,
        comment: "As a team manager, this platform has been a game-changer. Managing my team and tournament registrations has never been easier!"
      },
      {
        user: players[5]._id,
        rating: 5,
        comment: "Excellent platform for sports enthusiasts! The live match updates and tournament tracking features are phenomenal."
      },
      {
        user: organizers[0]._id,
        rating: 5,
        comment: "SportsHub has revolutionized how we organize tournaments. The scheduling, team management, and match tracking features are top-notch!"
      }
    ]);
    console.log(`✅ Created ${feedbacks.length} feedback entries`);

    // ========== SEED REQUESTS (Player/Team Requests) ==========
    const requests = await Request.create([
      // PLAYER_TO_TEAM requests
      {
        requestType: "PLAYER_TO_TEAM",
        sender: players[0]._id,
        receiver: managers[0]._id,
        team: teams[0]._id,
        status: "PENDING",
        message: "I am interested in joining Gujarat Warriors. I have 8 years of cricket experience and am a great all-rounder.",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "PLAYER_TO_TEAM",
        sender: players[4]._id,
        receiver: managers[1]._id,
        team: teams[1]._id,
        status: "PENDING",
        message: "Looking to play for Surat Strikers. I'm a dedicated all-rounder with tournament experience.",
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "PLAYER_TO_TEAM",
        sender: players[5]._id,
        receiver: managers[1]._id,
        team: teams[3]._id,
        status: "ACCEPTED",
        message: "I'd like to join Ahmedabad FC. I'm a striker with 6 years of professional experience.",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "PLAYER_TO_TEAM",
        sender: players[8]._id,
        receiver: managers[2]._id,
        team: teams[4]._id,
        status: "REJECTED",
        message: "I'm interested in playing for Baroda United. I'm a experienced defender.",
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "PLAYER_TO_TEAM",
        sender: players[10]._id,
        receiver: managers[2]._id,
        team: teams[5]._id,
        status: "ACCEPTED",
        message: "Interested in joining Rajkot Riders basketball team as a forward.",
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "PLAYER_TO_TEAM",
        sender: players[13]._id,
        receiver: managers[3]._id,
        team: teams[6]._id,
        status: "PENDING",
        message: "Would love to be a part of Gandhinagar Giants. I'm a skilled center.",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      // TEAM_TO_PLAYER requests
      {
        requestType: "TEAM_TO_PLAYER",
        sender: managers[0]._id,
        receiver: players[2]._id,
        team: teams[0]._id,
        status: "PENDING",
        message: "We've been impressed by your performance. Would you like to join Gujarat Warriors?",
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TEAM_TO_PLAYER",
        sender: managers[1]._id,
        receiver: players[3]._id,
        team: teams[1]._id,
        status: "ACCEPTED",
        message: "Your batting skills are exceptional. We'd like to have you in Surat Strikers.",
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TEAM_TO_PLAYER",
        sender: managers[2]._id,
        receiver: players[6]._id,
        team: teams[4]._id,
        status: "PENDING",
        message: "We're looking for an experienced defender. Your profile caught our attention.",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TEAM_TO_PLAYER",
        sender: managers[3]._id,
        receiver: players[12]._id,
        team: teams[6]._id,
        status: "REJECTED",
        message: "We'd like you to join our basketball team.",
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TEAM_TO_PLAYER",
        sender: managers[4]._id,
        receiver: players[9]._id,
        team: teams[8]._id,
        status: "ACCEPTED",
        message: "You're exactly what we need for Vadodara Volley Kings. Please join us!",
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TEAM_TO_PLAYER",
        sender: managers[5]._id,
        receiver: players[14]._id,
        team: teams[9]._id,
        status: "PENDING",
        message: "We're building Gandhinagar Spikers and need talented players like you.",
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      },
      // ORGANIZER_AUTHORIZATION requests
      {
        requestType: "ORGANIZER_AUTHORIZATION",
        sender: admin._id,
        receiver: organizers[0]._id,
        status: "PENDING",
        message: "Your organizer profile is under review. Please provide additional documentation if needed.",
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "ORGANIZER_AUTHORIZATION",
        sender: admin._id,
        receiver: organizers[1]._id,
        status: "ACCEPTED",
        message: "Your authorization has been approved. You can now create tournaments.",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "ORGANIZER_AUTHORIZATION",
        sender: admin._id,
        receiver: organizers[2]._id,
        status: "REJECTED",
        message: "Your authorization request has been rejected. Please contact support for more details.",
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      },
      // TOURNAMENT_BOOKING requests
      {
        requestType: "TOURNAMENT_BOOKING",
        sender: managers[0]._id,
        receiver: organizers[0]._id,
        tournament: tournaments[0]._id,
        bookingEntity: teams[0]._id,
        status: "PENDING",
        message: "We'd like to book Gujarat Warriors for the Gujarat Cricket Championship 2026.",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TOURNAMENT_BOOKING",
        sender: managers[1]._id,
        receiver: organizers[0]._id,
        tournament: tournaments[0]._id,
        bookingEntity: teams[1]._id,
        status: "ACCEPTED",
        message: "Surat Strikers would like to participate in the tournament.",
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TOURNAMENT_BOOKING",
        sender: players[0]._id,
        receiver: organizers[1]._id,
        tournament: tournaments[2]._id,
        status: "PENDING",
        message: "I would like to register as an individual player for Vadodara Football Carnival.",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TOURNAMENT_BOOKING",
        sender: managers[2]._id,
        receiver: organizers[1]._id,
        tournament: tournaments[2]._id,
        bookingEntity: teams[4]._id,
        status: "REJECTED",
        message: "Baroda United wants to participate in Vadodara Football Carnival.",
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        requestType: "TOURNAMENT_BOOKING",
        sender: players[5]._id,
        receiver: organizers[2]._id,
        tournament: tournaments[4]._id,
        status: "ACCEPTED",
        message: "I'm interested in the Basketball Tournament 2026.",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`✅ Created ${requests.length} total requests`);

    // ========== SEED BOOKINGS (Tournament Registrations) ==========
    const bookings = await Booking.create([
      // Team Bookings - Successful
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[0]._id,
        tournament: tournaments[0]._id,
        team: teams[0]._id,
        registrationType: "Team",
        amount: 50000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[1]._id,
        tournament: tournaments[0]._id,
        team: teams[1]._id,
        registrationType: "Team",
        amount: 50000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[1]._id,
        tournament: tournaments[1]._id,
        team: teams[2]._id,
        registrationType: "Team",
        amount: 30000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[2]._id,
        tournament: tournaments[1]._id,
        team: teams[3]._id,
        registrationType: "Team",
        amount: 30000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000)
      },
      // Team Bookings - Pending Payment
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[2]._id,
        tournament: tournaments[3]._id,
        team: teams[4]._id,
        registrationType: "Team",
        amount: 40000,
        status: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[3]._id,
        tournament: tournaments[3]._id,
        team: teams[5]._id,
        registrationType: "Team",
        amount: 40000,
        status: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      // Team Bookings - Cancelled
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[4]._id,
        tournament: tournaments[4]._id,
        team: teams[6]._id,
        registrationType: "Team",
        amount: 35000,
        status: "Cancelled",
        paymentStatus: "Refunded",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      // Player Bookings - Successful (Individual Tournaments)
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[0]._id,
        tournament: tournaments[2]._id,
        player: players[0]._id,
        registrationType: "Player",
        amount: 2000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[5]._id,
        tournament: tournaments[2]._id,
        player: players[5]._id,
        registrationType: "Player",
        amount: 2000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[10]._id,
        tournament: tournaments[6]._id,
        player: players[10]._id,
        registrationType: "Player",
        amount: 1500,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
      },
      // Player Bookings - Pending Payment
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[1]._id,
        tournament: tournaments[6]._id,
        player: players[1]._id,
        registrationType: "Player",
        amount: 1500,
        status: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[11]._id,
        tournament: tournaments[7]._id,
        player: players[11]._id,
        registrationType: "Player",
        amount: 1000,
        status: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      // Player Bookings - Payment Failed
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[3]._id,
        tournament: tournaments[6]._id,
        player: players[3]._id,
        registrationType: "Player",
        amount: 1500,
        status: "Confirmed",
        paymentStatus: "Failed",
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      },
      // Team Bookings for Completed Tournaments
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[0]._id,
        tournament: tournaments[9]._id,
        team: teams[0]._id,
        registrationType: "Team",
        amount: 45000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000)
      },
      {
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: managers[1]._id,
        tournament: tournaments[9]._id,
        team: teams[1]._id,
        registrationType: "Team",
        amount: 45000,
        status: "Confirmed",
        paymentStatus: "Success",
        createdAt: new Date(now.getTime() - 148 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`✅ Created ${bookings.length} tournament bookings (${bookings.filter(b => b.status === "Confirmed").length} confirmed, ${bookings.filter(b => b.status === "Pending").length} pending, ${bookings.filter(b => b.status === "Cancelled").length} cancelled)`);

    // ========== SUMMARY ==========
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Sports: ${createdSports.length}`);
    console.log(`   Tournament Organizers: ${organizers.length}`);
    console.log(`   Team Managers: ${managers.length}`);
    console.log(`   Players: ${players.length}`);
    console.log(`   Teams: ${teams.length}`);
    console.log(`   Tournaments: ${tournaments.length}`);
    console.log(`   Matches: ${matches.length}`);
    console.log(`   Payments: ${payments.length}`);
    console.log(`   Requests: ${requests.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Feedback: ${feedbacks.length}`);
    console.log('\n📝 Sample Login Credentials:');
    console.log('   👤 Admin: admin@gmail.com / Admin123!');
    console.log('   🏢 Organizer: testorganizer@gmail.com / Password123!');
    console.log('   👨‍💼 Manager: testmanager@gmail.com / Password123!');
    console.log('   🏃 Player: testplayer@gmail.com / Password123!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Login with any of the above credentials');
    console.log('   3. Explore the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
