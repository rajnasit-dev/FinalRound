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
      enum: ["Revenue", "Tournament", "User", "Match", "Booking"],
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
      status: { type: String, default: "all" },
      sport: { type: String, default: "all" },
      payerType: { type: String, default: "all" },
      format: { type: String, default: "all" },
      role: { type: String, default: "all" },
      registrationType: { type: String, default: "all" },
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
