import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { prisma } from "../lib/prisma.js";

const normalizeBaseUrl = (value = "") => String(value).replace(/\/+$/, "");

const externalBaseUrl = normalizeBaseUrl(
  process.env.OAUTH_BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  ""
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

/** Google OAuth strategy setup. */
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

/** Facebook OAuth strategy setup. */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: facebookCallbackUrl,
      profileFields: ["id", "displayName", "emails"],
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
