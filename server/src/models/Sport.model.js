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
    minPlayers: {
      type: Number, // e.g. 11 for Cricket
    },
    maxPlayers: {
      type: Number, // e.g. 11 for Cricket
    },
    roles: {
      type: [String],
      default: ["Player"], // Available roles for this sport
    },
    isActive: {
      type: Boolean,
      default: true, // Admin can disable a sport
    },
  },
  { timestamps: true }
);

export const Sport = model("Sport", sportSchema);
