import { Schema, model } from "mongoose";

const groundSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      required: true,
    },
    city: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // who added this ground in system
      required: true,
    },
    sportsSupported: [
      {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        required: true,
      },
    ],
    photos: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Ground = model("Ground", groundSchema);
