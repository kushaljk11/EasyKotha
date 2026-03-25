import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("Email credentials not found in environment variables");
}

/**
 * SMTP transporter used by backend email notifications.
 */
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || "smtp.gmail.com",
  port: EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Sends an email using configured SMTP credentials.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Easy Kotha" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};
