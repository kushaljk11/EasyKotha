import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { prisma } from "../lib/prisma.js";

const normalizeBaseUrl = (value = "") => String(value).replace(/\/+$/, "");

const productionHostedBaseUrl = "https://easykotha.onrender.com";
const isRenderRuntime = process.env.RENDER === "true";
const fallbackBaseUrl = isRenderRuntime ? productionHostedBaseUrl : "";

const externalBaseUrl = normalizeBaseUrl(
  process.env.OAUTH_BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  fallbackBaseUrl
);

const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  (externalBaseUrl
    ? `${externalBaseUrl}/api/oauth/google/callback`
    : "/api/oauth/google/callback");

const facebookCallbackUrl =
  process.env.FACEBOOK_CALLBACK_URL ||
  (externalBaseUrl
    ? `${externalBaseUrl}/api/oauth/facebook/callback`
    : "/api/oauth/facebook/callback");

console.log("[OAuth Debug] GOOGLE_CALLBACK_URL env:", process.env.GOOGLE_CALLBACK_URL || "(empty)");
console.log("[OAuth Debug] OAUTH_BASE_URL env:", process.env.OAUTH_BASE_URL || "(empty)");
console.log("[OAuth Debug] RENDER_EXTERNAL_URL env:", process.env.RENDER_EXTERNAL_URL || "(empty)");
console.log("[OAuth Debug] BACKEND_URL env:", process.env.BACKEND_URL || "(empty)");
console.log("[OAuth Debug] Resolved googleCallbackUrl:", googleCallbackUrl);
console.log("[OAuth Debug] Resolved facebookCallbackUrl:", facebookCallbackUrl);

// ---------------- GOOGLE STRATEGY ----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ---------------- FACEBOOK STRATEGY ----------------
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: facebookCallbackUrl,
      profileFields: ["id", "displayName", "emails"], // request email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email associated with this Facebook account"), null);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: email,
              facebookId: profile.id,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
