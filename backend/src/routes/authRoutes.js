import { Router } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { HttpError, UNIQUE_VIOLATION, runInBackground } from "../lib/errors.js";
import { checkPassword, hashPassword } from "../lib/passwords.js";
import { SESSION_COOKIE } from "../lib/session.js";
import { handleValidationErrors, validateLogin, validateSignup } from "../middleware/validation.js";
import { GoogleSignInError, findOrCreateGoogleUser } from "../services/googleUsers.js";
import { addWelcomePuzzle } from "../services/puzzles.js";

const LOGIN_FAILED = "Incorrect username or password.";
const ALREADY_REGISTERED = "That username or email is already registered.";

// Values for the ?login= query string the frontend turns into a message.
const GOOGLE_FAILURE_CODES = { email_in_use: "email-in-use" };

const publicUser = ({ user_id, username }) => ({ user_id, username });

function logIn(req, user) {
  return new Promise((resolve, reject) => {
    req.login(user, (error) => (error ? reject(error) : resolve()));
  });
}

export function createAuthRouter({ db, mailer, config, passport, limiters }) {
  const router = Router();

  // The session stores only the user id. Each request loads the id and username, never the hash.
  passport.serializeUser((user, done) => done(null, user.user_id));
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await db.query("SELECT user_id, username FROM users WHERE user_id = $1", [id]);
      done(null, rows[0] ?? false);
    } catch (error) {
      done(error);
    }
  });

  router.get("/session", (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not logged in." });
    res.json({ user: publicUser(req.user) });
  });

  router.post("/signup", limiters.signup, validateSignup, handleValidationErrors, async (req, res) => {
    const { username, email, password } = req.body;
    const passwordHash = await hashPassword(password);

    let user;
    try {
      user = await db.transaction(async (tx) => {
        const taken = await tx.query(
          "SELECT 1 FROM users WHERE username = $1 OR lower(email) = $2",
          [username, email],
        );
        if (taken.rows.length > 0) throw new HttpError(409, ALREADY_REGISTERED);
        const { rows } = await tx.query(
          "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username",
          [username, email, passwordHash],
        );
        await addWelcomePuzzle(tx, rows[0].user_id, config.welcomeGridId);
        return rows[0];
      });
    } catch (error) {
      // Two sign-ups racing for the same name get past the check above but not the constraint.
      if (error.code === UNIQUE_VIOLATION) throw new HttpError(409, ALREADY_REGISTERED);
      throw error;
    }

    await logIn(req, publicUser(user));
    runInBackground(mailer.sendWelcomeEmail(user.username, email), "welcome email");
    res.status(201).json({ user: publicUser(user) });
  });

  router.post("/login", limiters.login, validateLogin, handleValidationErrors, async (req, res) => {
    const { username, password } = req.body;
    const { rows } = await db.query(
      "SELECT user_id, username, password FROM users WHERE username = $1",
      [username],
    );
    const account = rows[0];
    if (account && !account.password) {
      throw new HttpError(401, "This account signs in with Google. Use the Sign in with Google button.");
    }
    if (!(await checkPassword(password, account?.password))) throw new HttpError(401, LOGIN_FAILED);

    await logIn(req, publicUser(account));
    res.json({ user: publicUser(account) });
  });

  router.post("/logout", (req, res, next) => {
    req.logout((logoutError) => {
      if (logoutError) return next(logoutError);
      req.session.destroy((destroyError) => {
        if (destroyError) return next(destroyError);
        res.clearCookie(SESSION_COOKIE, { path: "/" });
        res.status(204).end();
      });
    });
  });

  if (config.google) {
    passport.use(
      new GoogleStrategy(
        { ...config.google, scope: ["email", "profile"] },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const { user, email, created } = await findOrCreateGoogleUser(db, profile, config);
            if (created) runInBackground(mailer.sendWelcomeEmail(user.username, email), "welcome email");
            done(null, publicUser(user));
          } catch (error) {
            if (error instanceof GoogleSignInError) return done(null, false, { reason: error.reason });
            done(error);
          }
        },
      ),
    );

    router.get("/google", passport.authenticate("google"));

    router.get("/google/redirect", (req, res, next) => {
      passport.authenticate("google", (error, user, info) => {
        if (error) {
          console.error("Google sign-in failed:", error);
          return res.redirect("/?login=failed");
        }
        if (!user) return res.redirect(`/?login=${GOOGLE_FAILURE_CODES[info?.reason] ?? "failed"}`);
        req.logIn(user, (loginError) => (loginError ? next(loginError) : res.redirect("/home")));
      })(req, res, next);
    });
  } else {
    router.get(["/google", "/google/redirect"], (req, res) => {
      res.redirect("/?login=google-unavailable");
    });
  }

  return router;
}
