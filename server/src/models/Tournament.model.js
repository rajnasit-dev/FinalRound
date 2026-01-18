import { Schema, model } from "mongoose";

const tournamentSchema = new Schema(
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
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tournament Organizer
      required: true,
    },
    format: {
      type: String,
      enum: ["League", "Knockout", "Round Robin"],
      default: "League",
    },
    description: {
      type: String,
      trim: true,
    },
    teamLimit: {
      type: Number,
      required: true,
    },
    playersPerTeam: {
      type: Number,
    },
    registrationType: {
      type: String,
      enum: ["Team", "Player"],
      default: "Team"
    },
    registrationStart: {
      type: Date,
      required: true,
    },
    registrationEnd: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    entryFee: {
      type: Number,
      default: 0,
    },
    prizePool: {
      type: String,
    },
    rules: [
      {
        type: String,
      }
    ],
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
    bannerUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Live", "Completed", "Cancelled"],
    },
    registeredTeams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    approvedTeams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    isScheduleCreated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Tournament = model("Tournament", tournamentSchema);
