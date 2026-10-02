import { Router } from "express";
import { HttpError, UNIQUE_VIOLATION } from "../lib/errors.js";
import { checkPassword, hashPassword } from "../lib/passwords.js";
import {
  handleValidationErrors,
  validateChangePassword,
  validateEmailChange,
  validateUsernameChange,
} from "../middleware/validation.js";

const USERNAME_TAKEN = "That username is taken.";
const EMAIL_TAKEN = "That email address is already registered.";
const WRONG_PASSWORD = "Your current password is incorrect.";

// The Settings page. Runs behind requireAuth and only ever changes the logged-in user.
export function createAccountRouter({ db }) {
  const router = Router();

  async function currentPasswordHash(userId) {
    const { rows } = await db.query("SELECT password FROM users WHERE user_id = $1", [userId]);
    return rows[0]?.password ?? null;
  }

  router.get("/", async (req, res) => {
    const { rows } = await db.query(
      `SELECT user_id, username, email,
              password IS NOT NULL AS has_password,
              google_id IS NOT NULL AS google_linked
       FROM users WHERE user_id = $1`,
      [req.user.user_id],
    );
    if (rows.length === 0) throw new HttpError(404, "Account not found.");
    res.json(rows[0]);
  });

  // Anyone can rename themselves; puzzles show the new name everywhere because they're linked by id.
  router.patch("/username", validateUsernameChange, handleValidationErrors, async (req, res) => {
    const { username } = req.body;
    const userId = req.user.user_id;
    try {
      const { rows } = await db.query(
        `UPDATE users SET username = $1
         WHERE user_id = $2
           AND NOT EXISTS (SELECT 1 FROM users WHERE username = $1 AND user_id <> $2)
         RETURNING user_id, username`,
        [username, userId],
      );
      if (rows.length === 0) throw new HttpError(409, USERNAME_TAKEN);
      res.json({ user: rows[0] });
    } catch (error) {
      if (error.code === UNIQUE_VIOLATION) throw new HttpError(409, USERNAME_TAKEN);
      throw error;
    }
  });

  // Password accounts confirm their current password. Google-only accounts have none to confirm.
  router.patch("/email", validateEmailChange, handleValidationErrors, async (req, res) => {
    const { email, currentPassword = "" } = req.body;
    const userId = req.user.user_id;
    const hash = await currentPasswordHash(userId);
    if (hash && !(await checkPassword(currentPassword, hash))) throw new HttpError(400, WRONG_PASSWORD);

    try {
      const { rows } = await db.query(
        `UPDATE users SET email = $1
         WHERE user_id = $2
           AND NOT EXISTS (SELECT 1 FROM users WHERE lower(email) = $1 AND user_id <> $2)
         RETURNING email`,
        [email, userId],
      );
      if (rows.length === 0) throw new HttpError(409, EMAIL_TAKEN);
      res.json({ email: rows[0].email });
    } catch (error) {
      if (error.code === UNIQUE_VIOLATION) throw new HttpError(409, EMAIL_TAKEN);
      throw error;
    }
  });

  router.put("/password", validateChangePassword, handleValidationErrors, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;
    const hash = await currentPasswordHash(userId);
    if (!hash) {
      throw new HttpError(400, "This account signs in with Google, so it has no password to change.");
    }
    if (!(await checkPassword(currentPassword, hash))) throw new HttpError(400, WRONG_PASSWORD);
    await db.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      await hashPassword(newPassword),
      userId,
    ]);
    res.json({ message: "Password changed." });
  });

  return router;
}
