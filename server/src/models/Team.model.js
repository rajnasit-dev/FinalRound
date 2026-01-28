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
    gender: {
      type: String,
      enum: ["Male", "Female", "Mixed"],
      default: "Mixed"
    },
    logoUrl: String,
    bannerUrl: String,
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
