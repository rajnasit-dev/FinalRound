import mongoose from "mongoose";

const websiteSettingsSchema = new mongoose.Schema(
  {
    platformFee: {
      type: Number,
      required: true,
      default: 500,
      min: 0,
    },
    heroVideoUrl: {
      type: String,
      default: null,
    },
    siteName: {
      type: String,
      default: "SportsHub",
    },
    siteDescription: {
      type: String,
      default: "Sports Tournament Management Platform",
    },
    contactEmail: {
      type: String,
      default: "contact@sportshub.com",
    },
    contactPhone: {
      type: String,
      default: "+1234567890",
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
websiteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const WebsiteSettings = mongoose.model("WebsiteSettings", websiteSettingsSchema);
