import { Router } from "express";

const MAX_SEARCH_LENGTH = 50;
const SEARCH_LIMIT = 20;

// Makes % and _ in the search text match literally instead of acting as LIKE wildcards.
function escapeLike(text) {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

// Finding other players to share with. Runs behind requireAuth.
export function createPeopleRouter({ db, config }) {
  const router = Router();

  // Usernames containing the search text, best matches (those starting with it) first. Only
  // usernames are returned, never emails or ids.
  router.get("/search", async (req, res) => {
    const search = String(req.query.q ?? "")
      .trim()
      .slice(0, MAX_SEARCH_LENGTH);
    const { rows } = await db.query(
      `SELECT username FROM users
       WHERE user_id <> $1 AND username ILIKE $2 ESCAPE '\\'
       ORDER BY strpos(lower(username), lower($3)), lower(username)
       LIMIT ${SEARCH_LIMIT}`,
      [req.user.user_id, `%${escapeLike(search)}%`, search],
    );
    res.json({ users: rows.map((row) => row.username) });
  });

  // Everyone the user has traded puzzles with, most recent first. The welcome puzzle is left out,
  // or every account would look connected to whoever made it.
  router.get("/me/connections", async (req, res) => {
    const { rows } = await db.query(
      `WITH exchanges AS (
         SELECT s.user_id AS other_id, 1 AS sent, 0 AS received, s.created_at
         FROM solver_grids s
         JOIN crossword_grids g ON g.grid_id = s.grid_id
         WHERE g.user_id = $1 AND s.user_id <> $1
           AND ($2::int IS NULL OR g.grid_id <> $2)
         UNION ALL
         SELECT g.user_id, 0, 1, s.created_at
         FROM solver_grids s
         JOIN crossword_grids g ON g.grid_id = s.grid_id
         WHERE s.user_id = $1 AND g.user_id <> $1
           AND ($2::int IS NULL OR g.grid_id <> $2)
       )
       SELECT u.username,
              sum(e.sent)::int AS sent,
              sum(e.received)::int AS received,
              max(e.created_at) AS last_shared_at
       FROM exchanges e
       JOIN users u ON u.user_id = e.other_id
       GROUP BY u.user_id, u.username
       ORDER BY last_shared_at DESC, lower(u.username)`,
      [req.user.user_id, config.welcomeGridId],
    );
    res.json({ connections: rows });
  });

  return router;
}
