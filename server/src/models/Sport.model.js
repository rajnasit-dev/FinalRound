import { Schema, model } from "mongoose";

const sportSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    teamBased: {
      type: Boolean,
      required: true, // true = Cricket, Football | false = Chess, Badminton
    },
    roles: {
      type: [String],
      default: ["Player"], // Available roles for this sport
    },
    playersPerTeam: {
      type: Number,
      default: null, // Number of players per team for team-based sports
    },
    isActive: {
      type: Boolean,
      default: true, // Admin can disable a sport
    },
  },
  { timestamps: true }
);

export const Sport = model("Sport", sportSchema);
