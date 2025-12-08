import { Schema } from "mongoose";
import { User } from "./User.model.js";

const teamManagerSchema = new Schema({
  teams: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  achievements: {
    title: String,
    year: Number,
  },
});

export const TeamManager = User.discriminator("TeamManager", teamManagerSchema);
