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

dotenv.config();

const normalizeOrigin = (value) => value?.replace(/\/$/, "").trim();

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL || ""),
  normalizeOrigin(process.env.CLIENT_URL || ""),
  ...configuredOrigins,
].filter(Boolean);

const geminiApiKey = String(process.env.GEMINI_API_KEY || "").trim();
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const sessions = new Map();

/**
 * Trust proxy headers so protocol/origin detection works behind hosting proxies.
 */
app.set("trust proxy", 1);

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

app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin || "");
    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use('/api', authRoutes);
app.use('/api', emailrouter);
app.use('/api', postrouter);
app.use("/api/bookings", bookingrouter);
app.use("/api", adminRouter);
// Keeps compatibility for clients still calling /api/auth/* paths.
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagerouter);
app.use("/api/oauth", Oauthrouter);
app.use("/api/payment", paymentRouter);

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({
      error: "message and sessionId are required"
    });
  }

  if (!genAI) {
    return res.status(503).json({
      error: "Chatbot is not configured. Missing GEMINI_API_KEY.",
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

    const providerMessage = String(error?.message || "");

    if (error?.status === 403 && providerMessage.toLowerCase().includes("reported as leaked")) {
      return res.status(503).json({
        error: "Chatbot API key was blocked as leaked. Please rotate GEMINI_API_KEY and restart backend.",
      });
    }

    if (error?.status === 403) {
      return res.status(503).json({
        error: "Chatbot access denied by AI provider. Check GEMINI_API_KEY permissions.",
      });
    }

    return res.status(500).json({ error: "Gemini failed" });
  }
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await testDatabaseConnection();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
