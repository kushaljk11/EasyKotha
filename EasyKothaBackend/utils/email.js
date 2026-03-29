import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT,
  SMTP_MAIL,
  SMTP_PASS,
  SMTP_HOST,
  SMTP_PORT,
} = process.env;

const mailUser = String(EMAIL_USER || SMTP_MAIL || "").trim();
const mailPass = String(EMAIL_PASS || SMTP_PASS || "").trim();
const mailHost = String(EMAIL_HOST || SMTP_HOST || "smtp.gmail.com").trim();
const mailPort = Number(EMAIL_PORT || SMTP_PORT || 587);

if (!mailUser || !mailPass) {
  throw new Error(
    "Email credentials not found. Set EMAIL_USER/EMAIL_PASS or SMTP_MAIL/SMTP_PASS",
  );
}

/**
 * SMTP transporter used by backend email notifications.
 */
const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: false,
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

/**
 * Sends an email using configured SMTP credentials.
 */
export const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Easy Kotha" <${mailUser}>`,
      to,
      subject,
      text,
      html,
      replyTo,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};
