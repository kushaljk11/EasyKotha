import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { getAdminStats } from "../controller/admin.controller.js";
import { authMiddleware, adminOnly } from "../middleware/auth.Middleware.js";

const adminRouter = express.Router();

/**
 * Validates auth token and loads user profile for admin route checks.
 */
export const protectRoute = async (req, res, next) => {
  try {
    // Accept token from cookie or Authorization header.
    let token = req.cookies?.jwt;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log("No token found in cookies or Authorization header");
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log("Token verification failed");
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: true,
        city: true,
        profileImage: true,
        status: true,
      }
    });

    if (!user) {
      console.log("User not found with userId:", decoded.userId);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("User authenticated:", user.id, user.name);

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

adminRouter.get("/admin/detailed-stats", authMiddleware, adminOnly, getAdminStats);

export default adminRouter;