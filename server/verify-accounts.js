import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./src/models/User.model.js";
import { Request } from "./src/models/Request.model.js";
import Booking from "./src/models/Booking.model.js";
import { Tournament } from "./src/models/Tournament.model.js";

const verifyAccounts = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log("✅ Connected to MongoDB\n");

    // Admin account
    const admin = await User.findOne({ email: "admin@gmail.com" });
    if (!admin) {
      console.log("❌ Admin account not found!\n");
    } else {
      console.log("👤 ADMIN ACCOUNT:");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      
      const adminRequests = await Request.find({ receiver: admin._id });
      console.log(`   Received Requests: ${adminRequests.length}`);
      console.log(`   - Authorization Requests: ${adminRequests.filter(r => r.requestType === "ORGANIZER_AUTHORIZATION").length}\n`);
    }

    // Organizer account (arjunpatel0@gmail.com)
    const organizer = await User.findOne({ email: "arjunpatel0@gmail.com" });
    if (!organizer) {
      console.log("❌ Organizer account not found!\n");
    } else {
      console.log("🏢 ORGANIZER ACCOUNT:");
      console.log(`   Email: ${organizer.email}`);
      console.log(`   Name: ${organizer.fullName}`);
      console.log(`   Role: ${organizer.role}`);
      
      const orgSentRequests = await Request.find({ sender: organizer._id });
      const orgReceivedRequests = await Request.find({ receiver: organizer._id });
      console.log(`   Sent Requests: ${orgSentRequests.length}`);
      console.log(`   - Authorization Requests: ${orgSentRequests.filter(r => r.requestType === "ORGANIZER_AUTHORIZATION").length}`);
      console.log(`   Received Requests: ${orgReceivedRequests.length}\n`);
    }

    // Player account (arjunpatel200@gmail.com)
    const player = await User.findOne({ email: "arjunpatel200@gmail.com" });
    if (!player) {
      console.log("❌ Player account not found!\n");
    } else {
      console.log("👤 PLAYER ACCOUNT:");
      console.log(`   Email: ${player.email}`);
      console.log(`   Name: ${player.fullName}`);
      console.log(`   Role: ${player.role}`);
      
      const playerSentRequests = await Request.find({ sender: player._id });
      const playerReceivedRequests = await Request.find({ receiver: player._id });
      const playerBookings = await Booking.find({ user: player._id });
      
      console.log(`   Sent Requests: ${playerSentRequests.length}`);
      console.log(`   - Player to Team: ${playerSentRequests.filter(r => r.requestType === "PLAYER_TO_TEAM").length}`);
      console.log(`   Received Requests: ${playerReceivedRequests.length}`);
      console.log(`   - Team to Player: ${playerReceivedRequests.filter(r => r.requestType === "TEAM_TO_PLAYER").length}`);
      console.log(`   Tournament Bookings/Registrations: ${playerBookings.length}`);
      
      if (playerBookings.length > 0) {
        console.log(`\n   Booking Details:`);
        for (const booking of playerBookings) {
          const tournament = await Tournament.findById(booking.tournament);
          console.log(`   - ${tournament.name}: ${booking.status} (Payment: ${booking.paymentStatus})`);
        }
      }
    }

    await mongoose.connection.close();
    console.log("\n✅ Verification complete");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

verifyAccounts();
