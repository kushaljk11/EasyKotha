import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const normalizedOrigin = normalizeOrigin(origin || "");
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by Socket CORS"));
    },
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

/**
 * Keeps the current connection id for each signed-in user.
 */
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id); 

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Broadcasts online user ids to all connected clients.
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };