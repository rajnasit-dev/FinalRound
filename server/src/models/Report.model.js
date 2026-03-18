import { Schema, model } from "mongoose";

const reportSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["UserPlayer", "RevenuePayment", "Tournament"],
      required: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateRange: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    filters: {
      sport: { type: String, default: "all" },
      organizerId: { type: String, default: "all" },
      userPlayerScope: { type: String, enum: ["all", "users", "players", "manager", "player", "teamManager"], default: "player" },
    },
    summary: {
      type: Schema.Types.Mixed,
      default: {},
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const Report = model("Report", reportSchema);
