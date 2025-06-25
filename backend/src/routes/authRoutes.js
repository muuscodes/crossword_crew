import { Router } from "express";
// import session from "express-session";
import passport from "passport";
const router = Router();
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const callback = process.env.CALLBACK_URI;

passport.use(
  new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: callback,
    },
    function (accessToken, refreshToken, profile, cb) {
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware
const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};
// router.use(session({ secret: "cats" }));
// router.use(passport.initialize());
// router.use(passport.session());

router.get("/", (req, res) => {
  try {
    res.send('<a href="/auth/google">Authentication</a>');
  } catch (error) {
    console.log("Not working: ", error);
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failure" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/protected");
  }
);

router.get("/failure", (req, res) => {
  res.send("Failed");
});

router.get("/protected", isLoggedIn, (req, res) => {
  res.send("Hello!");
});

export default router;
