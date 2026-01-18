import { Schema } from "mongoose";
import { User } from "./User.model.js";

const adminSchema = new Schema({
  permissions: [
    {
      type: String,
      enum: [
        "manage_users",
        "manage_organizers",
        "manage_tournaments",
        "manage_teams",
        "manage_matches",
        "manage_payments",
        "view_analytics",
        "manage_sports",
      ],
      default: ["manage_users", "manage_organizers", "manage_tournaments", "manage_teams", "manage_matches", "manage_payments", "view_analytics", "manage_sports"],
    },
  ],
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
  },
});

export const Admin = User.discriminator("Admin", adminSchema);
