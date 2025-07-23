import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
const router = Router();
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import {
  jwtMiddleware,
  handleValidationErrors,
  validateAddUser,
  validateGetUser,
  loginLimiter,
  validateSession,
} from "../middleware/validationMiddleware.js";
import { sendWelcomeEmail } from "./emailRoutes.js";

dotenv.config();
const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const callback = process.env.GOOGLE_CALLBACK_URI;

passport.serializeUser((user, done) => {
  return done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);
    return done(null, user.rows[0]);
  } catch (error) {
    return done(error, null);
  }
});

// Get the session
router.get("/session", validateSession, (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).send({
      user_id: req.session.user.user_id,
      username: req.session.user.username,
    });
  } else {
    return res.status(401).send({ message: "Not authenticated" });
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
        const { googleId, displayName, emails } = profile;
        const email = emails[0].value;

        const existingUser = await pool.query(
          "SELECT * FROM users WHERE google_id = $1 OR email = $2",
          [googleId, email]
        );
        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]);
        }

        const newUser = await pool.query(
          "INSERT INTO users (google_id, username, email) VALUES ($1, $2, $3) RETURNING *",
          [googleId, displayName, email]
        );

        const newUserData = newUser.rows[0];

        // Add the welcome grid if its not the first user

        if (newUserData.user_id > 1) {
          const gridData = await pool.query(
            "SELECT * FROM crossword_grids WHERE user_id = $1 AND grid_id = $2",
            [1, 1]
          );
          if (gridData.rows.length === 0) {
            return res.status(404).send({ message: "Grid not found" });
          }
          const puzzleTitle = gridData.rows[0].puzzle_title;
          const gridSize = gridData.rows[0].grid_size;
          const currentGridNumbers = gridData.rows[0].grid_numbers;
          const blackSquares = gridData.rows[0].black_squares;
          const acrossClueValues = gridData.rows[0].across_clues;
          const downClueValues = gridData.rows[0].down_clues;
          const clueNumDirection = gridData.rows[0].clue_number_directions;
          const completed = false;
          const cleanGridValues = Array(gridSize * gridSize).fill("");

          const recipientUserId = newUserData.user_id;

          await pool.query(
            `INSERT INTO solver_grids
        (grid_id, user_id, completed_status, puzzle_title, grid_size, grid_values, grid_numbers, black_squares, across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              1,
              recipientUserId,
              completed,
              puzzleTitle,
              gridSize,
              cleanGridValues,
              currentGridNumbers,
              blackSquares,
              acrossClueValues,
              downClueValues,
              clueNumDirection,
            ]
          );

          await pool.query(
            `INSERT INTO user_library (user_id, solver_grid_id) VALUES ($1, $2)
      `,
            [newUserData.user_id, 1]
          );
        }

        await sendWelcomeEmail(displayName, email);

        return done(null, newUserData);
      } catch (error) {
        console.error("Database error:", error);
        return done(error, null);
      }
    }
  )
);

// Authentication route
router.get("/google", passport.authenticate("google"), (req, res) => {
  return res.status(200).send({ message: "Authentication initiated" });
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

      const userData = {
        username: req.user.username,
        user_id: req.user.user_id,
      };

      req.session.user = userData;

      return res.redirect("/home");
    });
  }
);

// Get google user data
router.get("/google/user", (req, res) => {
  if (req.isAuthenticated()) {
    const token = jwt.sign(
      { user_id: req.user.user_id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).send({ user: req.user, token });
  } else {
    return res.status(401).send({ message: "User not authenticated" });
  }
});

// Failure route
router.get("/failure", (req, res) => {
  return res
    .status(400)
    .send({ message: "Google login failed, please try again" });
});

// Normal user sign up route
router.post(
  "/signup",
  validateAddUser,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1 OR username = $2",
        [email, username]
      );
      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .send({ message: "Username or email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, hashedPassword]
      );
      const newUserData = newUser.rows[0];

      const token = jwt.sign(
        { user_id: newUserData.user_id, username: newUserData.username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      // Add the welcome grid if its not the first user

      if (newUserData.user_id > 1) {
        const gridData = await pool.query(
          "SELECT * FROM crossword_grids WHERE user_id = $1 AND grid_id = $2",
          [1, 1]
        );
        if (gridData.rows.length === 0) {
          return res.status(404).send({ message: "Grid not found" });
        }
        const puzzleTitle = gridData.rows[0].puzzle_title;
        const gridSize = gridData.rows[0].grid_size;
        const currentGridNumbers = gridData.rows[0].grid_numbers;
        const blackSquares = gridData.rows[0].black_squares;
        const acrossClueValues = gridData.rows[0].across_clues;
        const downClueValues = gridData.rows[0].down_clues;
        const clueNumDirection = gridData.rows[0].clue_number_directions;
        const completed = false;
        const cleanGridValues = Array(gridSize * gridSize).fill("");

        const recipientUserId = newUserData.user_id;

        const result = await pool.query(
          `INSERT INTO solver_grids
        (grid_id, user_id, completed_status, puzzle_title, grid_size, grid_values, grid_numbers, black_squares, across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            1,
            recipientUserId,
            completed,
            puzzleTitle,
            gridSize,
            cleanGridValues,
            currentGridNumbers,
            blackSquares,
            acrossClueValues,
            downClueValues,
            clueNumDirection,
          ]
        );

        await pool.query(
          `INSERT INTO user_library (user_id, solver_grid_id) VALUES ($1, $2)
      `,
          [newUserData.user_id, 1]
        );
      }

      await sendWelcomeEmail(username, email);

      return res.status(200).send({ user: newUserData, token });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Normal user login route
router.post(
  "/login",
  loginLimiter,
  validateGetUser,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, password } = req.body;

      const existingUser = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
          );

          req.login(user, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).send({ message: "Login has failed" });
            }
            const userData = {
              username: req.user.username,
              user_id: req.user.user_id,
            };
            req.session.user = userData;
            return res.status(200).send({ user: userData, token });
          });
        } else {
          return res.status(401).send({ message: "Incorrect password" });
        }
      } else {
        return res.status(401).send({ message: "User not found" });
      }
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Logout route
router.get("/logout", jwtMiddleware, (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).send({ message: "Could not log out" });
      }
      return res.status(200).send({ message: "User logged out" });
    });
  } else {
    return res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
