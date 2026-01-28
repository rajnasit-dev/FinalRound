import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    requestType: {
      type: String,
      enum: ["PLAYER_TO_TEAM", "TEAM_TO_PLAYER", "ORGANIZER_AUTHORIZATION", "TOURNAMENT_BOOKING"],
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For player/team join requests
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      sparse: true,
    },
    // For organizer authorization and tournament booking
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      sparse: true,
    },
    // For tournament booking - which entity is booking (team or player)
    bookingEntity: {
      type: Schema.Types.ObjectId,
      ref: function() {
        // This will be Team or Player depending on context
        return "Team";
      },
      sparse: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

// Index to prevent duplicate requests
requestSchema.index(
  { sender: 1, receiver: 1, team: 1, requestType: 1 },
  { unique: true, sparse: true, partialFilterExpression: { status: "PENDING" } }
);

// Index for tournament requests
requestSchema.index(
  { sender: 1, receiver: 1, tournament: 1, requestType: 1 },
  { unique: true, sparse: true, partialFilterExpression: { status: "PENDING" } }
);

export const Request = model("Request", requestSchema);
