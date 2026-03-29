import dotenv from 'dotenv';
import { sendEmail } from '../utils/email.js';
dotenv.config();

const normalizeEnvValue = (value = '') => String(value).trim();

const SUPPORT_EMAIL =
  normalizeEnvValue(process.env.SUPPORT_EMAIL) ||
  normalizeEnvValue(process.env.ADMIN_EMAIL) ||
  normalizeEnvValue(process.env.EMAIL_USER) ||
  normalizeEnvValue(process.env.SMTP_MAIL);

/**
 * Sends a contact-form message to the support mailbox.
 */
const sendContactEmail = async (email, subject, message) => {
  try {
    console.log(`Sending email from: ${email}, Subject: ${subject}`);

    if (!SUPPORT_EMAIL) {
      throw new Error('Support inbox email is not configured');
    }

    const info = await sendEmail({
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `From: ${email}\n\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export { sendContactEmail };

const handler = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({
        error: 'Email, subject, and message are required',
      });
    }

    await sendContactEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send email',
    });
  }
};

export default handler;