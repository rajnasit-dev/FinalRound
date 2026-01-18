import { Schema, model } from "mongoose";

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User", // Team Manager
      required: true,
    },
    captain: {
      type: Schema.Types.ObjectId,
      ref: "User", // Player
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Player
      },
    ],
    city: {
      type: String,
      trim: true,
    },
    logoUrl: String,
    description: {
      type: String,
      trim: true,
    },
    achievements: [
      {
        title: String,
        year: Number,
      },
    ],
    openToJoin: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Team = model("Team", teamSchema);
