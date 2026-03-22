import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const Oauthrouter = Router();
const FRONTEND_URL =
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || "").replace(/\/$/, "");

const normalize = (value = "") => String(value).trim().replace(/\/+$/, "");

const forcedHttpsHosts = (process.env.FORCE_HTTPS_HOSTS || "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

const resolveRequestOrigin = (req) => {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "")
    .split(",")[0]
    .trim();
  const host = forwardedHost || req.get("host") || "";

  if (!host) return "";

  const protocolGuess = forwardedProto || req.protocol || "http";
  const lowerHost = host.toLowerCase();
  const shouldForceHttps =
    protocolGuess === "https" ||
    forcedHttpsHosts.some((configuredHost) => lowerHost.includes(configuredHost));

  return `${shouldForceHttps ? "https" : "http"}://${host}`;
};

const resolveCallbackBaseUrl = (req) =>
  normalize(
    process.env.OAUTH_BASE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      process.env.PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      resolveRequestOrigin(req)
  );

const resolveGoogleCallbackUrl = (req) => {
  const explicit = normalize(process.env.GOOGLE_CALLBACK_URL || "");
  if (explicit) return explicit;

  const base = resolveCallbackBaseUrl(req);
  return `${base}/api/oauth/google/callback`;
};

const resolveFacebookCallbackUrl = (req) => {
  const explicit = normalize(process.env.FACEBOOK_CALLBACK_URL || "");
  if (explicit) return explicit;

  const base = resolveCallbackBaseUrl(req);
  return `${base}/api/oauth/facebook/callback`;
};

// ---------------- GOOGLE ----------------
Oauthrouter.get(
  "/google",
  (req, res, next) => {
    const callbackURL = resolveGoogleCallbackUrl(req);
    if (!callbackURL) {
      return res.status(500).json({ message: "Google callback URL is not configured" });
    }

    return passport.authenticate("google", {
      scope: ["profile", "email"],
      callbackURL,
    })(req, res, next);
  }
);

Oauthrouter.get(
  "/google/callback",
  (req, res, next) => {
    const callbackURL = resolveGoogleCallbackUrl(req);
    if (!callbackURL) {
      return res.status(500).json({ message: "Google callback URL is not configured" });
    }

    return passport.authenticate("google", {
      session: false,
      callbackURL,
    })(req, res, next);
  },
  (req, res) => {
    if (!FRONTEND_URL) {
      return res.status(500).json({ message: "FRONTEND_URL is not configured" });
    }

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
  (req, res, next) => {
    const callbackURL = resolveFacebookCallbackUrl(req);
    if (!callbackURL) {
      return res.status(500).json({ message: "Facebook callback URL is not configured" });
    }

    return passport.authenticate("facebook", {
      scope: ["email"],
      callbackURL,
    })(req, res, next);
  }
);

Oauthrouter.get(
  "/facebook/callback",
  (req, res, next) => {
    const callbackURL = resolveFacebookCallbackUrl(req);
    if (!callbackURL) {
      return res.status(500).json({ message: "Facebook callback URL is not configured" });
    }

    return passport.authenticate("facebook", {
      session: false,
      callbackURL,
    })(req, res, next);
  },
  (req, res) => {
    if (!FRONTEND_URL) {
      return res.status(500).json({ message: "FRONTEND_URL is not configured" });
    }

    const token = jwt.sign(
      { userId: req.user.id || req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

export default Oauthrouter;
