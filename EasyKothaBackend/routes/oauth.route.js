import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const Oauthrouter = Router();
const FRONTEND_URL =
  (process.env.FRONTEND_URL || "https://easykotha.onrender.com").replace(/\/$/, "");

// ---------------- GOOGLE ----------------
Oauthrouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

Oauthrouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id || req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

// ---------------- FACEBOOK ----------------
Oauthrouter.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

Oauthrouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id || req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

export default Oauthrouter;
