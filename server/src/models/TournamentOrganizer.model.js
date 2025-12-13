import { Schema } from "mongoose";
import { User } from "./User.model.js";

const tournamentOrganizerSchema = new Schema({
  orgName: {
    type: String,
    required: true,
  },
  sports: {
    type: Schema.Types.ObjectId,
    ref: "Sport",
  },
  isVerifiedOrganizer: {
    type: Boolean,
    default: false,
  },
  documents: String,
});

export const TournamentOrganizer = User.discriminator(
  "TournamentOrganizer",
  tournamentOrganizerSchema
);
