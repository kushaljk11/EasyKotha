import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import cors from "cors";
import emailrouter from './routes/email.route.js';
import postrouter from './routes/post.route.js';
import bookingrouter from './routes/booking.route.js';
import adminRouter from './routes/admin.route.js';
import messagerouter from './routes/message.route.js';
import Oauthrouter from './routes/oauth.route.js';
import paymentRouter from './routes/payment.route.js';
import passport from './config/passport.js';
import { app, server } from './lib/socket.js';
import { testDatabaseConnection } from './lib/prisma.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sessions = new Map();

const SYSTEM_PROMPT = `
You are EasyKotha Helper, a friendly and helpful virtual assistant for EasyKotha — a platform that helps users find rooms and rental accommodations.

Your job is to guide users through the website and help them with common tasks.

You can help with:

Finding Rooms
- Help users search for rooms based on location, price, and availability.
- Suggest using the search bar on the homepage.
- Guide them to apply filters such as price range, room type, and amenities.

Website Navigation
- Homepage: users can search for rooms and view featured listings.
- Listings Page: shows available rooms with filters and sorting options.
- Room Details Page: users can see photos, price, description, and contact information.
- Dashboard: users can manage saved listings and account settings.

Account Help
- To change password: go to Dashboard → Account Settings → Change Password.
- To update profile: go to Dashboard → Profile Settings.
- If users forget their password: click "Forgot Password" on the login page and follow the email reset instructions.

Booking / Contact
- Users can contact the room owner from the Room Details page.
- Encourage users to review details and availability before contacting.

Guidelines:
- Be friendly, clear, and concise.
- Provide step-by-step instructions when guiding users through the website.
- If you are unsure about something, politely suggest contacting support.
- Use helpful tone like a real website assistant.

Keep responses short and helpful.
`;

dotenv.config();

// const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', emailrouter);
app.use('/api', postrouter);
app.use("/api/bookings", bookingrouter);
app.use("/api", adminRouter);
app.use("/api/auth", authRoutes); // Keep support for /api/auth/login etc
app.use("/api/messages", messagerouter);
app.use("/api/oauth", Oauthrouter);
app.use("/api/payment", paymentRouter);
app.use(passport.initialize());

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({
      error: "message and sessionId are required"
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = sessions.get(sessionId) || [];

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    history.push(
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: responseText }] }
    );

    sessions.set(sessionId, history);

    res.json({ reply: responseText });

  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Gemini failed" });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testDatabaseConnection();
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
