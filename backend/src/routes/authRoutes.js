import { Router } from "express";
import passport from "passport";
const router = Router();
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { pool } from "../db.js";
import bcrypt from "bcrypt";

dotenv.config();
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const callback = process.env.GOOGLE_CALLBACK_URI;

passport.serializeUser((user, done) => {
  done(null, user.userid);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE userid = $1", [
      id,
    ]);
    done(null, user.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: callback,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Check if user already exists in the database
        const existingUser = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [id]
        );
        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]); // User exists, return user
        }

        // If not, create a new user
        const newUser = await pool.query(
          "INSERT INTO users (google_id, username, email) VALUES ($1, $2, $3) RETURNING *",
          [id, displayName, email]
        );

        return done(null, newUser.rows[0]); // Return the new user
      } catch (error) {
        console.error("Database error:", error);
        return done(error, null);
      }
    }
  )
);

// Authentication route
router.get("/google", passport.authenticate("google"), (req, res) => {
  return res.status(200).send("Authentication initiated");
});

// Redirect route
router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/failure" }),
  (req, res) => {
    req.login(req.user, (err) => {
      if (err) {
        return res.status(500).send({ message: "Login failed" });
      }
      return res.json(req.user);
    });
  }
);

// Failure route
router.get("/failure", (req, res) => {
  res.status(200).send("Google login failed, please try again");
});

// Normal user sign up route
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists in the database
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .send({ message: "Username or email already exists" });
    }

    // If not, create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );
    return res.status(200).send(newUser.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Normal user sign in route
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.login(user, (err) => {
          if (err) {
            return res.status(500).send({ message: "Login failed" });
          }
          return res.status(200).send(user);
        });
      }
    }

    // If not, send error
    return res
      .status(401)
      .send({ message: "Incorrect login, please try again" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).send({ message: "Could not log out" });
    }
    res.redirect("/");
  });
});

export default router;
