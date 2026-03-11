import nodemailer from "nodemailer";
import { Settings } from "../models/Settings.model.js";

export const sendEmail = async (data) => {
  try {
    // Skip non-critical emails if notifications are disabled
    if (!data.critical) {
      const emailEnabled = await Settings.getSetting("emailNotificationsEnabled", true);
      if (!emailEnabled) {
        console.log("Email notifications disabled — skipped:", data.subject);
        return true;
      }
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: 'nasitraj5678@gmail.com',
      to: data.email,
      subject: data.subject,
      text: data.message,
      html: data.html || data.message,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.log("Email not sent : ", error);
  }
};
