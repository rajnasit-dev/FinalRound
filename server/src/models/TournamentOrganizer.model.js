import { Schema } from "mongoose";
import { User } from "./User.model.js";

const tournamentOrganizerSchema = new Schema({
  orgName: {
    type: String,
    required: true,
  },
  isVerifiedOrganizer: {
    type: Boolean,
    default: false,
  },
  isAuthorized: {
    type: Boolean,
    default: false,
  },
  verificationDocumentUrl: {
    type: String,
  },
  authorizationRequestDate: {
    type: Date,
    default: Date.now,
  },
  authorizedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  authorizedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  documents: String,
});

export const TournamentOrganizer = User.discriminator(
  "TournamentOrganizer",
  tournamentOrganizerSchema
);
