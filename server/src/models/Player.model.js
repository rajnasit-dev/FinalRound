import { Schema } from "mongoose";
import { User } from "./User.model.js";

const playerSchema = new Schema({
  sports: [
    {
      type: Schema.Types.ObjectId,
      ref: "Sport",
    },
  ],
  playingRole: {
    type: String, // e.g. "Bowler", "Striker", "Defender"
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  achievements: {
    title: String,
    year: Number,
  },
  height: Number,
  weight: Number,
  age: Number,
  bio: String,
});

export const Player = User.discriminator("Player", playerSchema);
