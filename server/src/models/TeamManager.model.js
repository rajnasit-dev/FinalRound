import { Schema } from "mongoose";
import { User } from "./User.model.js";

const teamManagerSchema = new Schema({
  teams: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  achievements: {
    title: String,
    year: Number,
  },
});

export const TeamManager = User.discriminator("TeamManager", teamManagerSchema);
