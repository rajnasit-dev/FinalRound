import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    // Either team OR player will be set based on registration type
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },

    player: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    registrationType: {
      type: String,
      enum: ["Team", "Player"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ user: 1, tournament: 1 });
// bookingId already has unique: true in schema, no need for separate index

const Booking = model("Booking", bookingSchema);
export default Booking;
