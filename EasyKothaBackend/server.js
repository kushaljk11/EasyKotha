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
import passport from './config/passport.js';
import { app, server } from './lib/socket.js';


dotenv.config();

// const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
app.use(passport.initialize());


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
