import { Schema, model } from "mongoose";

const sportSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Outdoor", "Indoor"],
      required: true,
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
    iconUrl: {
      type: String, // for frontend icons
    },
    isActive: {
      type: Boolean,
      default: true, // Admin can disable a sport
    },
  },
  { timestamps: true }
);

export const Sport = model("Sport", sportSchema);
