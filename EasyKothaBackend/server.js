import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import cors from "cors";

dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are Aria, a friendly and helpful virtual assistant for ☕ Aroma Beans Coffee.
You help customers with:
- Our menu: Espresso, Cappuccino, Latte, Cold Brew, Matcha Latte.
- Store hours: Monday–Friday 7am–9pm, Saturday 8am–10pm, Sunday 9am–8pm.
- Locations: 42 Maple Street (Downtown), West End branch, Riverside branch.

Keep responses warm and concise. Use ☕ occasionally.
`;

const sessions = new Map();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use(express.json());

app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


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