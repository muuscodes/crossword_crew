import { Router } from "express";
import passport from "passport";
const router = Router();
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const callback = process.env.GOOGLE_CALLBACK_URI;
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: callback,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(accessToken);
      console.log(profile);
      done(null, undefined);
    }
  )
);

router.get("/google", passport.authenticate("google"), (req, res) => {
  res.send(200);
});
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.send(200);
});

export default router;
