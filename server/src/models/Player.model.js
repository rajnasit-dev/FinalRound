import { Schema } from "mongoose";
import { User } from "./User.model.js";

const playerSchema = new Schema({
  sports: [
    {
      sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        required: true,
      },
      role: {
        type: String, // e.g., "Batsman", "Bowler", "All-rounder" for Cricket; "Striker", "Midfielder", "Defender", "Goalkeeper" for Football
      }
    },
  ],
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  achievements: [
    {
      title: String,
      year: Number,
    },
  ],
  height: Number, // in feet
  weight: Number, // in kg
  dateOfBirth: Date,
  bio: String,
});

export const Player = User.discriminator("Player", playerSchema);
