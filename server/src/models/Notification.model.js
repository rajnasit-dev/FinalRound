import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "Team Invite",
        "Team Join Request",
        "Tournament Update",
        "Match Update",
        "Payment",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    data: {
      type: Schema.Types.Mixed, // extra info: ids, etc.
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);
