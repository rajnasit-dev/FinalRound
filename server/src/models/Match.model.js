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

    status: {
      type: String,
      enum: ["Scheduled", "Live", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    scoreA: {
      type: String, // simple text: "150/7 in 20 ov"
    },

    scoreB: {
      type: String,
    },

    resultText: {
      type: String, // "Team A won by 10 runs"
    },

    manOfTheMatch: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Match = model("Match", matchSchema);
