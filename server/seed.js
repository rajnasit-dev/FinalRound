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
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, month, day);
};

// First names for realistic data generation
const firstNamesM = ["Arjun", "Aryan", "Aditya", "Akshay", "Rajesh", "Rohan", "Rahul", "Ravi", "Sanjay", "Sandeep", "Karan", "Kamal", "Kaushik", "Vikram", "Viraj", "Vinod", "Vishal", "Harshil", "Hrithik", "Hemant", "Hardik", "Imran", "Ishant", "Jatin", "Jasprit", "Kunal", "Mahesh", "Manish", "Mayank", "Mohan", "Naveen", "Nikhil", "Nitesh", "Pankaj", "Parth", "Pawan", "Rishi", "Rishabh"];

const firstNamesF = ["Priya", "Priti", "Preeti", "Poonam", "Pooja", "Nikita", "Neha", "Nisha", "Nidhi", "Kanika", "Kavya", "Kalpana", "Kriti", "Isha", "Ila", "Indu", "Jaya", "Jasmine", "Megha", "Meera", "Mansi", "Harshita", "Hema", "Divya", "Deepa", "Deepika", "Archita", "Anuradha", "Anushka", "Ananya", "Anjali"];

const lastNames = ["Patel", "Shah", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Rao", "Menon", "Iyer", "Desai", "Joshi", "Bhat", "Srivastava", "Chopra", "Kapoor", "Malhotra", "Arora", "Saxena"];

const cities = ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Junagadh", "Porbandar", "Anand"];

const getRandomGender = () => ["Male", "Female"][Math.floor(Math.random() * 2)];
const getRandomCity = () => cities[Math.floor(Math.random() * cities.length)];
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateEmail = (firstName, lastName, index) => {
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}@gmail.com`;
};

const sports = [
  {
    name: "Cricket",
    teamBased: true,
    roles: ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"],
    isActive: true
  },
  {
    name: "Football",
    teamBased: true,
    roles: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger"],
    isActive: true
  },
  {
    name: "Basketball",
    teamBased: true,
    roles: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
    isActive: true
  },
  {
    name: "Volleyball",
    teamBased: true,
    roles: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero"],
    isActive: true
  },
  {
    name: "Tennis",
    teamBased: false,
    roles: ["Singles Player", "Doubles Player"],
    isActive: true
  },
  {
    name: "Badminton",
    teamBased: false,
    roles: ["Singles Player", "Doubles Player"],
    isActive: true
  },
  {
    name: "Table Tennis",
    teamBased: false,
    roles: ["Singles Player", "Doubles Player"],
    isActive: true
  },
  {
    name: "Kabaddi",
    teamBased: true,
    roles: ["Raider", "Defender", "All-Rounder"],
    isActive: true
  },
  {
    name: "Hockey",
    teamBased: true,
    roles: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker"],
    isActive: true
  },
  {
    name: "Chess",
    teamBased: false,
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

    // ========== SEED ADMIN ==========
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

    // ========== SEED ORGANIZERS (20) ==========
    const fixedOrganizers = [
      { firstName: "Arjun", lastName: "Patel", city: "Ahmedabad" },
      { firstName: "Rohan", lastName: "Shah", city: "Surat" },
      { firstName: "Vikram", lastName: "Sharma", city: "Vadodara" },
      { firstName: "Karan", lastName: "Singh", city: "Rajkot" },
      { firstName: "Rahul", lastName: "Kumar", city: "Gandhinagar" },
      { firstName: "Ravi", lastName: "Gupta", city: "Bhavnagar" },
      { firstName: "Sanjay", lastName: "Verma", city: "Jamnagar" },
      { firstName: "Aditya", lastName: "Reddy", city: "Junagadh" },
      { firstName: "Rajesh", lastName: "Rao", city: "Porbandar" },
      { firstName: "Manish", lastName: "Menon", city: "Anand" },
      { firstName: "Vishal", lastName: "Iyer", city: "Ahmedabad" },
      { firstName: "Nikhil", lastName: "Desai", city: "Surat" },
      { firstName: "Akshay", lastName: "Joshi", city: "Vadodara" },
      { firstName: "Hemant", lastName: "Bhat", city: "Rajkot" },
      { firstName: "Pankaj", lastName: "Chopra", city: "Gandhinagar" },
      { firstName: "Mohan", lastName: "Kapoor", city: "Bhavnagar" },
      { firstName: "Kunal", lastName: "Malhotra", city: "Jamnagar" },
      { firstName: "Harshil", lastName: "Arora", city: "Junagadh" },
      { firstName: "Mayank", lastName: "Saxena", city: "Porbandar" },
      { firstName: "Vinod", lastName: "Srivastava", city: "Anand" }
    ];
    
    const organizerPromises = fixedOrganizers.map((org, i) => ({
      fullName: `${org.firstName} ${org.lastName}`,
      email: `${org.firstName.toLowerCase()}${org.lastName.toLowerCase()}${i}@gmail.com`,
      password: "Password123!",
      phone: `+91-${String(9876543300 + i).slice(-10)}`,
      city: org.city,
      isVerified: true,
      isActive: true,
      orgName: `${org.firstName} ${org.lastName} Sports Organization`,
      isVerifiedOrganizer: true,
      isAuthorized: true
    }));
    const organizers = await TournamentOrganizer.create(organizerPromises);
    console.log(`✅ Created 20 tournament organizers`);

    // ========== SEED TEAM MANAGERS (20) ==========
    const fixedManagers = [
      { firstName: "Priya", lastName: "Patel", city: "Ahmedabad" },
      { firstName: "Aryan", lastName: "Shah", city: "Surat" },
      { firstName: "Neha", lastName: "Sharma", city: "Vadodara" },
      { firstName: "Ishant", lastName: "Singh", city: "Rajkot" },
      { firstName: "Kavya", lastName: "Kumar", city: "Gandhinagar" },
      { firstName: "Jatin", lastName: "Gupta", city: "Bhavnagar" },
      { firstName: "Megha", lastName: "Verma", city: "Jamnagar" },
      { firstName: "Parth", lastName: "Reddy", city: "Junagadh" },
      { firstName: "Divya", lastName: "Rao", city: "Porbandar" },
      { firstName: "Hrithik", lastName: "Menon", city: "Anand" },
      { firstName: "Ananya", lastName: "Iyer", city: "Ahmedabad" },
      { firstName: "Jasprit", lastName: "Desai", city: "Surat" },
      { firstName: "Isha", lastName: "Joshi", city: "Vadodara" },
      { firstName: "Rishabh", lastName: "Bhat", city: "Rajkot" },
      { firstName: "Kriti", lastName: "Chopra", city: "Gandhinagar" },
      { firstName: "Naveen", lastName: "Kapoor", city: "Bhavnagar" },
      { firstName: "Pooja", lastName: "Malhotra", city: "Jamnagar" },
      { firstName: "Kaushik", lastName: "Arora", city: "Junagadh" },
      { firstName: "Nisha", lastName: "Saxena", city: "Porbandar" },
      { firstName: "Rishi", lastName: "Srivastava", city: "Anand" }
    ];
    
    const managerPromises = fixedManagers.map((mgr, i) => ({
      fullName: `${mgr.firstName} ${mgr.lastName}`,
      email: `${mgr.firstName.toLowerCase()}${mgr.lastName.toLowerCase()}${100 + i}@gmail.com`,
      password: "Password123!",
      phone: `+91-${String(9876543400 + i).slice(-10)}`,
      city: mgr.city,
      isVerified: true,
      isActive: true,
      achievements: {
        title: `Team Manager of the Year - ${mgr.city} District`,
        year: 2024
      }
    }));
    const managers = await TeamManager.create(managerPromises);
    console.log(`✅ Created 20 team managers`);

    // ========== SEED PLAYERS (100 - 10 per sport) ==========
    const playerPromises = [];
    const playersPerSport = 10;
    
    const fixedPlayerNames = [
      { firstName: "Arjun", lastName: "Patel", gender: "Male", city: "Ahmedabad" },
      { firstName: "Priya", lastName: "Shah", gender: "Female", city: "Surat" },
      { firstName: "Rahul", lastName: "Sharma", gender: "Male", city: "Vadodara" },
      { firstName: "Neha", lastName: "Singh", gender: "Female", city: "Rajkot" },
      { firstName: "Karan", lastName: "Kumar", gender: "Male", city: "Gandhinagar" },
      { firstName: "Kavya", lastName: "Gupta", gender: "Female", city: "Bhavnagar" },
      { firstName: "Rohan", lastName: "Verma", gender: "Male", city: "Jamnagar" },
      { firstName: "Isha", lastName: "Reddy", gender: "Female", city: "Junagadh" },
      { firstName: "Vikram", lastName: "Rao", gender: "Male", city: "Porbandar" },
      { firstName: "Ananya", lastName: "Menon", gender: "Female", city: "Anand" }
    ];

    for (let sportIdx = 0; sportIdx < createdSports.length; sportIdx++) {
      const sport = createdSports[sportIdx];
      const roles = sport.roles;

      for (let i = 0; i < playersPerSport; i++) {
        const playerData = fixedPlayerNames[i];
        const firstName = playerData.firstName;
        const lastName = playerData.lastName;
        const gender = playerData.gender;
        const city = playerData.city;
        
        const sportData = [
          {
            sport: sport._id,
            role: roles[i % roles.length] // Use deterministic role selection
          }
        ];
        
        // Every 3rd player plays multiple sports (deterministic)
        if (i % 3 === 0 && createdSports.length > 1) {
          const secondSportIdx = (sportIdx + 1) % createdSports.length;
          const secondSport = createdSports[secondSportIdx];
          sportData.push({
            sport: secondSport._id,
            role: secondSport.roles[0]
          });
        }

        playerPromises.push({
          fullName: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}${lastName.toLowerCase()}${200 + (sportIdx * 10) + i}@gmail.com`,
          password: "Password123!",
          phone: `+91-${String(9876543500 + (sportIdx * 10) + i).slice(-10)}`,
          city: city,
          isVerified: true,
          isActive: true,
          sports: sportData,
          achievements: [
            { title: `${sport.name} State Championship Winner`, year: 2024 },
            { title: `Best Player Award - ${city} District`, year: 2023 }
          ],
          gender: gender,
          dateOfBirth: getDOBFromAge(18 + (i % 10)), // Deterministic ages 18-27
          height: 5.0 + (i % 15) * 0.1, // Height in feet.inches format (5.0 - 6.4 ft range)
          weight: 60 + (i * 2), // Deterministic weights
          bio: `Professional ${sport.name} player with ${2 + (i % 10)} years experience`
        });
      }
    }

    const players = await Player.create(playerPromises);
    console.log(`✅ Created 100 players (10 per sport)`);
    
    // Build a map of sport ID to player IDs for easier team creation
    const playersBySpport = new Map();
    players.forEach((player, index) => {
      // Each player is created with 10 players per sport across createdSports
      // We need to map them back based on the sportData structure
      const sportsArray = player.sports || [];
      sportsArray.forEach(sportItem => {
        const sportId = sportItem.sport.toString();
        if (!playersBySpport.has(sportId)) {
          playersBySpport.set(sportId, []);
        }
        playersBySpport.get(sportId).push(player._id);
      });
    });
    

    // ========== SEED TEAMS ==========
    const teamPromises = [];
    const teamPlayerMap = new Map(); // Track players per team
    
    for (let i = 0; i < managers.length; i++) {
      const manager = managers[i];
      const numTeams = Math.random() > 0.5 ? 2 : 1;

      for (let t = 0; t < numTeams; t++) {
        const sport = getRandomElement(createdSports);
        const sportIdStr = sport._id.toString();
        
        // Get players for this sport using our pre-built mapping
        const availablePlayerIds = playersBySpport.get(sportIdStr) || [];
        
        // Allocate 60-100% of sport's max players per team
        // Choose team size without relying on sport.maxPlayers
        const baseMin = sport.teamBased ? 5 : 1;
        const baseMax = sport.teamBased ? 12 : 2;
        const randomCount = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
        const teamPlayerCount = Math.min(randomCount, availablePlayerIds.length);
        
        // Shuffle available players and select team players
        const shuffledPlayerIds = availablePlayerIds.sort(() => Math.random() - 0.5);
        const teamPlayerIds = shuffledPlayerIds.slice(0, teamPlayerCount);
        
        const openToJoin = Math.random() > 0.4;
        const teamGender = ["Male", "Female", "Mixed"][Math.floor(Math.random() * 3)];
        const teamCity = getRandomCity();
        
        const teamData = {
          name: `${getRandomElement(firstNamesM)} ${sport.name} Warriors - ${teamCity}`,
          sport: sport._id,
          manager: manager._id,
          gender: teamGender,
          players: teamPlayerIds,
          city: teamCity,
          bannerUrl: `https://images.unsplash.com/photo-${['1517649763962-0c623066013b', '1461896836934-ffe607ba8211', '1519861155730-972f87d2b8f1'][Math.floor(Math.random() * 3)]}?w=1200&h=400&fit=crop`,
          description: `Professional ${sport.name} team. ${openToJoin ? 'Open to recruitment' : 'Not currently recruiting'}`,
          achievements: [
            { title: `${sport.name} District Champion 2024`, year: 2024 },
            { title: "Best Team Performance Award 2023", year: 2023 }
          ],
          openToJoin,
          isActive: true
        };
        
        teamPromises.push(teamData);
      }
    }

    const teams = await Team.create(teamPromises);
    // Build team player map for reference
    teams.forEach(team => {
      teamPlayerMap.set(team._id.toString(), team.players.length);
    });
    
    console.log(`✅ Created ${teams.length} teams`);
    console.log(`   Team player distribution:`);
    teams.forEach(team => {
      const playerCount = team.players ? team.players.length : 0;
      console.log(`   - ${team.name}: ${playerCount} players`);
    });

    // ========== SEED TOURNAMENTS ==========
    const now = new Date();
    const tournamentPromises = [];
    const tournamentStatusMap = new Map(); // Track which tournaments are Live/Completed
    
    for (let i = 0; i < organizers.length; i++) {
      const organizer = organizers[i];
      const numTournaments = Math.random() > 0.6 ? 2 : 1;

      for (let t = 0; t < numTournaments; t++) {
        const sport = getRandomElement(createdSports);
        const format = ["League", "Knockout", "Round Robin"][Math.floor(Math.random() * 3)];
        
        // Create tournaments with different statuses
        const tournamentStatusChance = Math.random();
        let registrationStart, registrationEnd, startDate, endDate, status;
        
        if (tournamentStatusChance > 0.7) {
          // 30% Live tournaments - already started, matches ongoing
          registrationStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          registrationEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
          endDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
          status = "Live";
        } else if (tournamentStatusChance > 0.4) {
          // 30% Completed tournaments - already finished
          registrationStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          registrationEnd = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          startDate = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
          endDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
          status = "Completed";
        } else {
          // 40% Upcoming tournaments - registration open
          registrationStart = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
          registrationEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
          startDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
          endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
          status = "Upcoming";
        }
        
        const city = getRandomCity();
        
        // Determine if this tournament is team-based or individual
        const isTeamBased = sport.teamBased;
        const registrationType = isTeamBased ? "Team" : "Player";
        const tournamentType = isTeamBased ? "Championship" : "Individual";
        const tournamentGender = ["Male", "Female", "Mixed"][Math.floor(Math.random() * 3)];

        // Set sport-specific min players per team for team-based tournaments
        let playersPerTeam = 1;
        if (isTeamBased) {
          const sportPlayersMap = {
            "Cricket": 11,
            "Football": 11,
            "Basketball": 5,
            "Volleyball": 6,
            "Kabaddi": 7,
            "Hockey": 11
          };
          playersPerTeam = sportPlayersMap[sport.name] || 11;
        }
        
        // Generate sport-specific rules
        const sportRulesMap = {
          "Cricket": [
            "Each team must have 11 players on the field",
            "Matches will follow standard ICC cricket rules",
            "Each team gets 2 innings (Test) or 1 innings (Limited Overs)",
            "DRS (Decision Review System) will be available",
            "No-ball and wide rules apply as per ICC guidelines"
          ],
          "Football": [
            "Each team must have 11 players on the field",
            "Matches follow FIFA standard rules",
            "90 minutes of play (45 minutes each half)",
            "Extra time and penalties in knockout stages",
            "Yellow and red card rules apply"
          ],
          "Basketball": [
            "Each team must have 5 players on the court",
            "Four quarters of 10 minutes each (FIBA rules)",
            "24-second shot clock applies",
            "6 team fouls per quarter allowed",
            "Overtime periods of 5 minutes if scores are tied"
          ],
          "Volleyball": [
            "Each team must have 6 players on the court",
            "Best of 5 sets format (first to 3 sets wins)",
            "First 4 sets played to 25 points, 5th set to 15 points",
            "Teams must win by 2 points",
            "Maximum 3 hits per side allowed"
          ],
          "Kabaddi": [
            "Each team must have 7 players on the mat",
            "Matches consist of two halves of 20 minutes each",
            "Raiders must chant 'Kabaddi' continuously",
            "Pro Kabaddi League rules apply",
            "Super tackles and bonus points applicable"
          ],
          "Hockey": [
            "Each team must have 11 players on the field",
            "Four quarters of 15 minutes each",
            "Penalty corners and penalty strokes as per FIH rules",
            "Unlimited substitutions allowed",
            "Video umpire available for goal decisions"
          ],
          "Tennis": [
            "Singles or doubles format",
            "Best of 3 or 5 sets format",
            "Tiebreakers at 6-6 in each set",
            "Lets and faults as per ITF rules",
            "Hawkeye technology available for line calls"
          ],
          "Badminton": [
            "Singles or doubles format",
            "Best of 3 games to 21 points",
            "Rally point system (point on every serve)",
            "Service rules as per BWF regulations",
            "2-point lead required to win a game"
          ],
          "Table Tennis": [
            "Singles or doubles format",
            "Best of 5 or 7 games to 11 points",
            "Service alternates every 2 points",
            "Let serves do not count",
            "2-point lead required to win a game"
          ],
          "Chess": [
            "FIDE standard rules apply",
            "Time control as specified by organizer",
            "Touch-move rule applies",
            "Draw offers allowed",
            "Arbiter decisions are final"
          ]
        };
        
        const rules = sportRulesMap[sport.name] || [
          "All participants must follow tournament guidelines",
          "Punctuality is mandatory for all matches",
          "Fair play and sportsmanship expected",
          "Organizer decisions are final"
        ];

        const tournamentData = {
          name: `${sport.name} ${tournamentType} ${new Date().getFullYear()} - ${city}`,
          sport: sport._id,
          organizer: organizer._id,
          format,
          description: isTeamBased 
            ? `Prestigious ${sport.name} team tournament featuring the best teams from the region`
            : `Individual ${sport.name} tournament featuring talented players from the region`,
          teamLimit: isTeamBased ? (Math.floor(Math.random() * 8) + 8) : Math.floor(Math.random() * 16) + 16,
          playersPerTeam,
          rules,
          registrationType,
          gender: tournamentGender,
          registrationStart,
          registrationEnd,
          startDate,
          endDate,
          entryFee: Math.floor(Math.random() * 50) * 1000,
          prizePool: `${Math.floor(Math.random() * 50) * 10000}`,
          ground: {
            name: `${city} Sports Complex`,
            city: city,
            address: `${city} Main Road, ${city}, Gujarat`
          },
          bannerUrl: `https://images.unsplash.com/photo-${['1517649763962-0c623066013b', '1461896836934-ffe607ba8211', '1519861155730-972f87d2b8f1', '1574629810360-7efbbe195018', '1546608235-3a3099921008'][Math.floor(Math.random() * 5)]}?w=1200&h=400&fit=crop`,
          isActive: true,
          registeredTeams: [],
          approvedTeams: [],
          registeredPlayers: [],
          approvedPlayers: []
        };
        
        tournamentPromises.push(tournamentData);
        tournamentStatusMap.set(tournamentData.name, { status, isTeamBased, sport });
      }
    }

    const tournaments = await Tournament.create(tournamentPromises);
    console.log(`✅ Created ${tournaments.length} tournaments`);

    // ========== REGISTER AND APPROVE TEAMS IN TOURNAMENTS ==========
    console.log(`\n📋 Tournament Registration Details:`);
    for (let i = 0; i < tournaments.length; i++) {
      const tournament = tournaments[i];
      const tournamentInfo = tournamentStatusMap.get(tournament.name);
      
      // Only register teams if tournament is team-based
      if (tournamentInfo && tournamentInfo.isTeamBased) {
        const relatedTeams = teams.filter(t => t.sport.toString() === tournament.sport.toString());
        
        if (relatedTeams.length > 0) {
          // Register 40-60% of related teams (no qualifying filter)
          const numTeamsToRegister = Math.ceil(relatedTeams.length * (0.4 + Math.random() * 0.2));
          const registeredTeams = relatedTeams.slice(0, numTeamsToRegister);
          
          // For Live and Completed tournaments, approve all registered teams
          const approvedTeams = (tournamentInfo.status === "Live" || tournamentInfo.status === "Completed") 
            ? registeredTeams 
            : registeredTeams.slice(0, Math.ceil(registeredTeams.length * 0.5)); // For Upcoming, approve 50%
          
          // Update tournament with registered and approved teams
          await Tournament.findByIdAndUpdate(tournament._id, {
            registeredTeams: registeredTeams.map(t => t._id),
            approvedTeams: approvedTeams.map(t => t._id),
            status: tournamentInfo.status
          });
          
          console.log(`   📍 ${tournament.name}`);
          console.log(`      - Status: ${tournamentInfo.status}`);
          console.log(`      - Players Required/Team: ${tournament.playersPerTeam}`);
          console.log(`      - Total Teams for Sport: ${relatedTeams.length}`);
          console.log(`      - Registered Teams: ${registeredTeams.length}`);
          console.log(`      - Approved Teams: ${approvedTeams.length}`);
        }
      }
      
      // Register and approve players for individual player tournaments
      if (tournamentInfo && !tournamentInfo.isTeamBased) {
        const relatedPlayers = players.filter(p => 
          p.sports.some(s => s.sport.toString() === tournament.sport.toString())
        );
        
        if (relatedPlayers.length > 0) {
          // Register 40-60% of related players
          const numPlayersToRegister = Math.floor(relatedPlayers.length * (0.4 + Math.random() * 0.2));
          const registeredPlayers = relatedPlayers.slice(0, numPlayersToRegister);
          
          // For Live and Completed tournaments, approve all registered players
          const approvedPlayers = (tournamentInfo.status === "Live" || tournamentInfo.status === "Completed") 
            ? registeredPlayers 
            : registeredPlayers.slice(0, Math.ceil(registeredPlayers.length * 0.5)); // For Upcoming, approve 50%
          
          // Update tournament with registered and approved players
          await Tournament.findByIdAndUpdate(tournament._id, {
            registeredPlayers: registeredPlayers.map(p => p._id),
            approvedPlayers: approvedPlayers.map(p => p._id),
            status: tournamentInfo.status
          });
          
          console.log(`   📍 ${tournament.name}`);
          console.log(`      - Status: ${tournamentInfo.status}`);
          console.log(`      - Total Players for Sport: ${relatedPlayers.length}`);
          console.log(`      - Registered Players: ${registeredPlayers.length}`);
          console.log(`      - Approved Players: ${approvedPlayers.length}`);
        }
      }
    }
    console.log(`✅ Registered and approved teams/players in tournaments`);

    // Reload tournaments to get updated registrations/approvals for match creation
    const refreshedTournaments = await Tournament.find({}).lean();

    // ========== SEED MATCHES (Only for Live/Completed tournaments with approved teams) ==========
    const matchPromises = [];
    
    for (let i = 0; i < refreshedTournaments.length; i++) {
      const tournament = refreshedTournaments[i];
      const tournamentInfo = tournamentStatusMap.get(tournament.name);
      
      // Only create matches for Live and Completed tournaments
      if (tournamentInfo && (tournamentInfo.status === "Live" || tournamentInfo.status === "Completed")) {
        let matchTeams = [];
        
        if (tournamentInfo.isTeamBased) {
          // Create matches between approved teams
          matchTeams = teams.filter(t => 
            tournament.approvedTeams.some(at => at.toString() === t._id.toString())
          );
        }
        
        // Only create matches if there are enough approved teams (at least 2)
        if (matchTeams.length >= 2) {
          const numMatches = Math.floor(Math.random() * 6) + 3; // 3-8 matches
          
          for (let m = 0; m < numMatches; m++) {
            const team1Index = Math.floor(Math.random() * matchTeams.length);
            let team2Index = Math.floor(Math.random() * matchTeams.length);
            while (team2Index === team1Index && matchTeams.length > 1) {
              team2Index = Math.floor(Math.random() * matchTeams.length);
            }
            
            const matchDate = new Date(tournament.startDate.getTime() + Math.random() * (tournament.endDate.getTime() - tournament.startDate.getTime()));
            const matchStatus = matchDate < now ? (Math.random() > 0.3 ? "Completed" : "Live") : "Scheduled";

            matchPromises.push({
              tournament: tournament._id,
              sport: tournament.sport,
              teamA: matchTeams[team1Index]._id,
              teamB: matchTeams[team2Index]._id,
              scheduledAt: matchDate,
              ground: tournament.ground,
              status: matchStatus
            });
          }
        }
      }
    }

    if (matchPromises.length > 0) {
      await Match.create(matchPromises);
      console.log(`✅ Created ${matchPromises.length} matches (fixtures)`);
    }

    // ========== SEED PAYMENTS ==========
    const paymentPromises = [];
    const paymentStatuses = ["Success", "Pending", "Failed", "Refunded"];
    const paymentProviders = ["Razorpay", "PayPal", "Stripe", "Google Pay"];
    
    // Team payments
    for (let i = 0; i < Math.min(15, tournaments.length); i++) {
      const randomTournament = tournaments[Math.floor(Math.random() * tournaments.length)];
      const randomTeam = teams.filter(t => t.sport.toString() === randomTournament.sport.toString())[0];
      const randomOrganizer = organizers[Math.floor(Math.random() * organizers.length)];
      
      if (randomTeam) {
        paymentPromises.push({
          tournament: randomTournament._id,
          team: randomTeam._id,
          payerType: "Team",
          organizer: randomOrganizer._id,
          amount: Math.floor(Math.random() * 40) * 1000 + 10000,
          currency: "INR",
          status: getRandomElement(paymentStatuses),
          provider: getRandomElement(paymentProviders),
          providerPaymentId: "pay_" + Math.random().toString(36).substr(2, 12)
        });
      }
    }
    
    // Player payments
    for (let i = 0; i < Math.min(10, tournaments.length); i++) {
      const randomTournament = tournaments[Math.floor(Math.random() * tournaments.length)];
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const randomOrganizer = organizers[Math.floor(Math.random() * organizers.length)];
      
      paymentPromises.push({
        tournament: randomTournament._id,
        player: randomPlayer._id,
        payerType: "Player",
        organizer: randomOrganizer._id,
        amount: Math.floor(Math.random() * 10) * 1000 + 1000,
        currency: "INR",
        status: getRandomElement(paymentStatuses),
        provider: getRandomElement(paymentProviders),
        providerPaymentId: "pay_" + Math.random().toString(36).substr(2, 12)
      });
    }
    
    const payments = await Payment.create(paymentPromises);
    console.log(`✅ Created ${payments.length} payments`);

    // ========== SEED FEEDBACK ==========
    const feedbacks = await Feedback.create([
      {
        user: players[0]._id,
        rating: 5,
        comment: "Amazing platform! Makes organizing and joining tournaments so easy."
      },
      {
        user: managers[0]._id,
        rating: 5,
        comment: "As a team manager, this platform has been a game-changer!"
      },
      {
        user: organizers[0]._id,
        rating: 5,
        comment: "SportsHub has revolutionized how we organize tournaments."
      }
    ]);
    console.log(`✅ Created ${feedbacks.length} feedback entries`);

    // ========== SEED REQUESTS ==========
    const requestPromises = [];
    
    // Specific requests for Arjun Patel organizer (first organizer - arjunpatel0@gmail.com)
    // Authorization request to admin
    requestPromises.push({
      requestType: "ORGANIZER_AUTHORIZATION",
      sender: organizers[0]._id,
      receiver: admin._id,
      status: "PENDING",
      message: `Authorization request for organizing tournaments from ${organizers[0].fullName}`
    });
    
    // Specific requests for Arjun Patel player (first player - arjunpatel200@gmail.com)
    // Player to Team requests (sent by Arjun the player)
    if (teams.length > 0) {
      requestPromises.push({
        requestType: "PLAYER_TO_TEAM",
        sender: players[0]._id,
        receiver: managers[0]._id,
        team: teams[0]._id,
        status: "PENDING",
        message: `I'm interested in joining your team - ${players[0].fullName}`
      });
      
      if (teams.length > 1) {
        requestPromises.push({
          requestType: "PLAYER_TO_TEAM",
          sender: players[0]._id,
          receiver: managers[1]._id,
          team: teams[1]._id,
          status: "ACCEPTED",
          message: `I would like to be part of your team - ${players[0].fullName}`
        });
      }
    }
    
    // Team to Player requests (received by Arjun the player)
    if (teams.length > 2) {
      requestPromises.push({
        requestType: "TEAM_TO_PLAYER",
        sender: managers[2]._id,
        receiver: players[0]._id,
        team: teams[2]._id,
        status: "PENDING",
        message: `We'd like to invite you to join our team!`
      });
    }
    
    // Player to Team requests
    for (let i = 1; i < Math.min(15, players.length); i++) {
      const randomPlayer = players[i];
      const randomManager = managers[Math.floor(Math.random() * managers.length)];
      const randomTeam = teams.filter(t => t.manager.toString() === randomManager._id.toString())[0];
      
      if (randomTeam) {
        requestPromises.push({
          requestType: "PLAYER_TO_TEAM",
          sender: randomPlayer._id,
          receiver: randomManager._id,
          team: randomTeam._id,
          status: getRandomElement(["PENDING", "ACCEPTED", "REJECTED"]),
          message: `I'm interested in joining your team as a ${randomTeam.name}`
        });
      }
    }
    
    // Team to Player requests
    for (let i = 0; i < Math.min(10, managers.length); i++) {
      const randomManager = managers[i];
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const randomTeam = teams.filter(t => t.manager.toString() === randomManager._id.toString())[0];
      
      if (randomTeam) {
        requestPromises.push({
          requestType: "TEAM_TO_PLAYER",
          sender: randomManager._id,
          receiver: randomPlayer._id,
          team: randomTeam._id,
          status: getRandomElement(["PENDING", "ACCEPTED", "REJECTED"]),
          message: `We'd like to invite you to join our team!`
        });
      }
    }
    
    // Tournament Booking requests
    for (let i = 0; i < Math.min(8, tournaments.length); i++) {
      const randomTournament = tournaments[i];
      const randomTeam = teams.filter(t => t.sport.toString() === randomTournament.sport.toString())[0];
      const randomManager = managers.find(m => m._id.toString() === randomTeam?.manager.toString());
      
      if (randomManager && randomTeam) {
        requestPromises.push({
          requestType: "TOURNAMENT_BOOKING",
          sender: randomManager._id,
          receiver: organizers[Math.floor(Math.random() * organizers.length)]._id,
          tournament: randomTournament._id,
          bookingEntity: randomTeam._id,
          status: getRandomElement(["PENDING", "ACCEPTED", "REJECTED"]),
          message: `Team booking request for ${randomTournament.name}`
        });
      }
    }
    
    // Organizer Authorization requests (skip first organizer as we already added specific request)
    for (let i = 1; i < 5 && i < organizers.length; i++) {
      const randomOrganizer = organizers[i];
      requestPromises.push({
        requestType: "ORGANIZER_AUTHORIZATION",
        sender: randomOrganizer._id,
        receiver: admin._id,
        status: getRandomElement(["PENDING", "ACCEPTED", "REJECTED"]),
        message: `Authorization request for organizing tournaments`
      });
    }
    
    const requests = await Request.create(requestPromises);
    console.log(`✅ Created ${requests.length} requests`);

    // ========== SEED BOOKINGS ==========
    const bookingPromises = [];
    const bookingStatuses = ["Pending", "Confirmed", "Cancelled"];
    const bookingPaymentStatuses = ["Pending", "Success", "Failed"];
    
    // Specific bookings for Arjun Patel player (first player - arjunpatel200@gmail.com)
    if (tournaments.length > 0) {
      bookingPromises.push({
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: players[0]._id,
        tournament: tournaments[0]._id,
        player: players[0]._id,
        registrationType: "Player",
        amount: tournaments[0].entryFee || 2000,
        status: "Confirmed",
        paymentStatus: "Success"
      });
      
      if (tournaments.length > 1) {
        bookingPromises.push({
          bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          user: players[0]._id,
          tournament: tournaments[1]._id,
          player: players[0]._id,
          registrationType: "Player",
          amount: tournaments[1].entryFee || 1500,
          status: "Pending",
          paymentStatus: "Pending"
        });
      }
    }
    
    // Team bookings
    for (let i = 0; i < Math.min(15, teams.length); i++) {
      const randomTeam = teams[i];
      const relatedTournaments = tournaments.filter(t => t.sport.toString() === randomTeam.sport.toString());
      
      if (relatedTournaments.length > 0) {
        const randomTournament = relatedTournaments[Math.floor(Math.random() * relatedTournaments.length)];
        const manager = managers.find(m => m._id.toString() === randomTeam.manager.toString());
        
        if (manager) {
          bookingPromises.push({
            bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            user: manager._id,
            tournament: randomTournament._id,
            team: randomTeam._id,
            registrationType: "Team",
            amount: randomTournament.entryFee || 50000,
            status: getRandomElement(bookingStatuses),
            paymentStatus: getRandomElement(bookingPaymentStatuses)
          });
        }
      }
    }
    
    // Player bookings (skip first player as we already added specific bookings)
    for (let i = 1; i < Math.min(15, players.length); i++) {
      const randomPlayer = players[i];
      const randomTournament = tournaments[Math.floor(Math.random() * tournaments.length)];
      
      bookingPromises.push({
        bookingId: "BOOK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user: randomPlayer._id,
        tournament: randomTournament._id,
        player: randomPlayer._id,
        registrationType: "Player",
        amount: Math.floor(Math.random() * 5) * 1000 + 500,
        status: getRandomElement(bookingStatuses),
        paymentStatus: getRandomElement(bookingPaymentStatuses)
      });
    }
    
    const bookings = await Booking.create(bookingPromises);
    console.log(`✅ Created ${bookings.length} bookings`);

    // ========== FINAL SUMMARY & CREDENTIALS ==========
    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS FOR TESTING');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Sample Player
    console.log('👤 SAMPLE PLAYER:');
    console.log(`   Email: ${players[0].email}`);
    console.log(`   Password: Password123!`);
    console.log(`   Sports: ${players[0].sports.map(s => {
      const sportName = createdSports.find(sp => sp._id.toString() === s.sport.toString())?.name;
      return `${sportName} (${s.role})`;
    }).join(', ')}`);
    console.log(`   City: ${players[0].city}\n`);

    // Sample Organizer
    console.log('🏢 SAMPLE ORGANIZER:');
    console.log(`   Email: ${organizers[0].email}`);
    console.log(`   Password: Password123!`);
    console.log(`   Organization: ${organizers[0].orgName}`);
    console.log(`   City: ${organizers[0].city}\n`);

    // Sample Team Manager
    console.log('👔 SAMPLE TEAM MANAGER:');
    console.log(`   Email: ${managers[0].email}`);
    console.log(`   Password: Password123!`);
    console.log(`   City: ${managers[0].city}`);
    console.log(`   Teams Managed: ${teams.filter(t => t.manager.toString() === managers[0]._id.toString()).length}\n`);

    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📊 COMPLETE SUMMARY:');
    console.log(`   ✅ Sports: ${createdSports.length}`);
    console.log(`   ✅ Admin: 1`);
    console.log(`   ✅ Tournament Organizers: ${organizers.length}`);
    console.log(`   ✅ Team Managers: ${managers.length}`);
    console.log(`   ✅ Players: ${players.length}`);
    console.log(`   ✅ Teams: ${teams.length}`);
    console.log(`   ✅ Tournaments: ${tournaments.length}`);
    console.log(`   ✅ Matches: ${matchPromises.length}`);
    console.log(`   ✅ Payments: ${payments.length}`);
    console.log(`   ✅ Requests: ${requests.length}`);
    console.log(`   ✅ Bookings: ${bookings.length}`);
    console.log(`   ✅ Feedback: ${feedbacks.length}\n`);
    
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
