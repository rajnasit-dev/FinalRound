import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    requestType: {
      type: String,
      enum: ["PLAYER_TO_TEAM", "TEAM_TO_PLAYER"],
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
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    message: {
      type: String,
      trim: true,
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

export const Request = model("Request", requestSchema);
