import { Schema, model } from "mongoose";

const matchSchema = new Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    sport: {
      type: Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },

    ground: {
      name: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },

    teamA: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },

    teamB: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },

    playerA: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    playerB: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Match = model("Match", matchSchema);
