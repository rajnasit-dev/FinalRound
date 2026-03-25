import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    // 🔹 Either team OR player will be set based on registration type
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },

    player: {
      type: Schema.Types.ObjectId,
      ref: "User", // Player
    },

    payerType: {
      type: String,
      enum: ["Team", "Player", "Organizer"],
      required: true,
    },

    payerName: {
      type: String,
      default: "Unknown",
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    entryFeeAmount: {
      type: Number,
      default: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },

    provider: {
      type: String, // Payment Gateway
    },

    providerPaymentId: {
      type: String,
    },

    paymentMethod: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Payment = model("Payment", paymentSchema);
