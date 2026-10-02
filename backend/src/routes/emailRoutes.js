import { Router } from "express";
import { HttpError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { handleValidationErrors, validateFeedback } from "../middleware/validation.js";

export function createEmailRouter({ db, mailer, limiters }) {
  const router = Router();

  // The Feedback page: bug reports, ideas and comments for whoever runs the site. The reply-to
  // address comes from the sender's account, so nobody has to type it.
  router.post(
    "/feedback",
    requireAuth,
    limiters.email,
    validateFeedback,
    handleValidationErrors,
    async (req, res) => {
      if (!mailer.isConfigured) {
        throw new HttpError(503, "Email isn't set up on this server yet, so feedback can't be sent.");
      }
      const { rows } = await db.query("SELECT email FROM users WHERE user_id = $1", [req.user.user_id]);
      const { kind, message, userAgent } = req.body;
      await mailer.sendFeedback({
        kind,
        message,
        userAgent: userAgent || null,
        username: req.user.username,
        email: rows[0]?.email ?? null,
      });
      res.json({ message: "Thanks! Your message is on its way." });
    },
  );

  return router;
}
