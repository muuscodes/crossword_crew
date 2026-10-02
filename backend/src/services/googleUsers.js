import { addWelcomePuzzle } from "./puzzles.js";

const MAX_USERNAME = 50;

// Thrown when a Google sign-in can't be completed for a reason the user should see.
export class GoogleSignInError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

// Google display names aren't unique, so add " 2", " 3", ... until the name is free.
export async function uniqueUsername(tx, preferred) {
  const base = preferred.trim().slice(0, MAX_USERNAME) || "Player";
  for (let suffix = 1; ; suffix++) {
    const candidate =
      suffix === 1 ? base : `${base.slice(0, MAX_USERNAME - String(suffix).length - 1)} ${suffix}`;
    const { rows } = await tx.query("SELECT 1 FROM users WHERE username = $1", [candidate]);
    if (rows.length === 0) return candidate;
  }
}

// Finds the account for a Google profile, creating one on first sign-in.
// Returns { user: { user_id, username }, email, created }.
export async function findOrCreateGoogleUser(db, profile, { welcomeGridId }) {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!googleId || !email) throw new GoogleSignInError("no_email");

  return db.transaction(async (tx) => {
    const byGoogleId = await tx.query("SELECT user_id, username FROM users WHERE google_id = $1", [
      googleId,
    ]);
    if (byGoogleId.rows[0]) return { user: byGoogleId.rows[0], email, created: false };

    const byEmail = await tx.query(
      "SELECT user_id, username, password, google_id FROM users WHERE lower(email) = $1",
      [email],
    );
    const existing = byEmail.rows[0];
    if (existing) {
      // Password sign-up doesn't verify email ownership, so linking here would let someone who
      // registered your address first share your account. Only legacy Google accounts (created
      // before google_id was stored, so they have neither a password nor a google_id) are linked.
      if (existing.password || existing.google_id) throw new GoogleSignInError("email_in_use");
      await tx.query("UPDATE users SET google_id = $1 WHERE user_id = $2", [
        googleId,
        existing.user_id,
      ]);
      return {
        user: { user_id: existing.user_id, username: existing.username },
        email,
        created: false,
      };
    }

    const username = await uniqueUsername(tx, profile.displayName || email.split("@")[0]);
    const { rows } = await tx.query(
      "INSERT INTO users (google_id, username, email) VALUES ($1, $2, $3) RETURNING user_id, username",
      [googleId, username, email],
    );
    await addWelcomePuzzle(tx, rows[0].user_id, welcomeGridId);
    return { user: rows[0], email, created: true };
  });
}
