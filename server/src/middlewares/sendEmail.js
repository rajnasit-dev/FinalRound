import nodemailer from "nodemailer";

export const sendEmail = async (data) => {
  try {
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
