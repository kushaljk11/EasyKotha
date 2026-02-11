import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASS,
  },
});

const sendContactEmail = async (email, subject, message) => {
  try {
    console.log(`Sending email from: ${email}, Subject: ${subject}`);

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: process.env.SMTP_MAIL, // Send to yourself
      replyTo: email, // User's email for reply
      subject: `Contact Form: ${subject}`,
      text: `From: ${email}\n\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
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