import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import models
import { Sport } from "./src/models/Sport.model.js";
import { Player } from "./src/models/Player.model.js";
import { TeamManager } from "./src/models/TeamManager.model.js";
import { TournamentOrganizer } from "./src/models/TournamentOrganizer.model.js";
import { Team } from "./src/models/Team.model.js";
import { Tournament } from "./src/models/Tournament.model.js";
import { Match } from "./src/models/Match.model.js";
import { Payment } from "./src/models/Payment.model.js";
import { Request } from "./src/models/Request.model.js";
import Booking from "./src/models/Booking.model.js";
import { Feedback } from "./src/models/Feedback.model.js";
import { User } from "./src/models/User.model.js";
import { Settings } from "./src/models/Settings.model.js";

async function connectDB() {
  try {
    const MONGODB_URI = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function deleteAllExceptAdmin() {
  console.log("\n🗑️  Deleting all data except Admin...\n");

  // Delete all non-admin users
  const usersDeleted = await User.deleteMany({ role: { $ne: "Admin" } });
  console.log(`  Users (non-admin): ${usersDeleted.deletedCount} deleted`);

  // Delete role-specific collections
  const playersDeleted = await Player.deleteMany({});
  console.log(`  Players: ${playersDeleted.deletedCount} deleted`);

  const managersDeleted = await TeamManager.deleteMany({});
  console.log(`  Team Managers: ${managersDeleted.deletedCount} deleted`);

  const organizersDeleted = await TournamentOrganizer.deleteMany({});
  console.log(`  Tournament Organizers: ${organizersDeleted.deletedCount} deleted`);

  // Delete all other collections
  const teamsDeleted = await Team.deleteMany({});
  console.log(`  Teams: ${teamsDeleted.deletedCount} deleted`);

  const tournamentsDeleted = await Tournament.deleteMany({});
  console.log(`  Tournaments: ${tournamentsDeleted.deletedCount} deleted`);

  const matchesDeleted = await Match.deleteMany({});
  console.log(`  Matches: ${matchesDeleted.deletedCount} deleted`);

  const paymentsDeleted = await Payment.deleteMany({});
  console.log(`  Payments: ${paymentsDeleted.deletedCount} deleted`);

  const requestsDeleted = await Request.deleteMany({});
  console.log(`  Requests: ${requestsDeleted.deletedCount} deleted`);

  const bookingsDeleted = await Booking.deleteMany({});
  console.log(`  Bookings: ${bookingsDeleted.deletedCount} deleted`);

  const feedbackDeleted = await Feedback.deleteMany({});
  console.log(`  Feedback: ${feedbackDeleted.deletedCount} deleted`);

  const sportsDeleted = await Sport.deleteMany({});
  console.log(`  Sports: ${sportsDeleted.deletedCount} deleted`);

  const settingsDeleted = await Settings.deleteMany({});
  console.log(`  Settings: ${settingsDeleted.deletedCount} deleted`);

  console.log("\n✅ All data deleted. Admin account preserved.\n");
}

async function run() {
  await connectDB();
  await deleteAllExceptAdmin();
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
