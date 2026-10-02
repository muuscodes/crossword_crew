import { Router } from "express";
import { incorrectCells, isSolved, normalizeLetter } from "../lib/crossword.js";
import { HttpError, runInBackground } from "../lib/errors.js";
import {
  handleValidationErrors,
  parseCellList,
  parsePuzzle,
  parseSolverValues,
  validateGridId,
  validateShare,
} from "../middleware/validation.js";
import { copyPuzzleToSolver } from "../services/puzzles.js";

const PUZZLE_NOT_FOUND = "Puzzle not found.";

// Every route here runs behind requireAuth and only touches the logged-in user's own rows.
export function createGridRouter({ db, mailer, limiters }) {
  const router = Router();
  const withGridId = [validateGridId, handleValidationErrors];

  router.get("/me/stats", async (req, res) => {
    const { rows } = await db.query(
      `SELECT
         (SELECT count(*)::int FROM crossword_grids WHERE user_id = $1) AS created,
         (SELECT count(*)::int FROM solver_grids s
            JOIN crossword_grids g ON g.grid_id = s.grid_id
            WHERE s.user_id = $1) AS received,
         (SELECT count(*)::int FROM solver_grids s
            JOIN crossword_grids g ON g.grid_id = s.grid_id
            WHERE s.user_id = $1 AND s.completed_status) AS solved`,
      [req.user.user_id],
    );
    const { created, received, solved } = rows[0];
    res.json({ total: created + received, created, received, solved });
  });

  router.get("/me/grids", async (req, res) => {
    const userId = req.user.user_id;
    const created = await db.query(
      `SELECT grid_id, puzzle_title, created_at
       FROM crossword_grids
       WHERE user_id = $1
       ORDER BY created_at DESC, grid_id DESC`,
      [userId],
    );
    const received = await db.query(
      `SELECT s.grid_id, s.puzzle_title, s.created_at,
              COALESCE(s.completed_status, false) AS completed_status,
              u.username AS creator_username
       FROM solver_grids s
       JOIN crossword_grids g ON g.grid_id = s.grid_id
       JOIN users u ON u.user_id = g.user_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC, s.grid_id DESC`,
      [userId],
    );
    res.json({ created: created.rows, received: received.rows });
  });

  router.post("/me/grids", async (req, res) => {
    const puzzle = parsePuzzle(req.body);
    const { rows } = await db.query(
      `INSERT INTO crossword_grids
         (user_id, puzzle_title, grid_size, grid_values, grid_numbers, black_squares,
          across_clues, down_clues, clue_number_directions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING grid_id`,
      [
        req.user.user_id,
        puzzle.title,
        puzzle.size,
        puzzle.values,
        puzzle.numbers,
        puzzle.black,
        puzzle.acrossClues,
        puzzle.downClues,
        puzzle.directions,
      ],
    );
    res.status(201).json({ grid_id: rows[0].grid_id });
  });

  router.get("/me/grids/:gridId", withGridId, async (req, res) => {
    const { rows } = await db.query(
      `SELECT g.grid_id, g.puzzle_title, g.grid_size, g.grid_values, g.black_squares,
              g.across_clues, g.down_clues, g.created_at,
              EXISTS (SELECT 1 FROM solver_grids s WHERE s.grid_id = g.grid_id) AS is_shared
       FROM crossword_grids g
       WHERE g.grid_id = $1 AND g.user_id = $2`,
      [req.params.gridId, req.user.user_id],
    );
    if (rows.length === 0) throw new HttpError(404, PUZZLE_NOT_FOUND);
    res.json(rows[0]);
  });

  // Locks the caller's puzzle for the rest of the transaction. Shared puzzles are frozen, because
  // every solver's copy and the answer key have to keep matching.
  async function lockOwnUnsharedPuzzle(tx, gridId, userId, action) {
    const { rows } = await tx.query(
      `SELECT EXISTS (SELECT 1 FROM solver_grids s WHERE s.grid_id = g.grid_id) AS is_shared
       FROM crossword_grids g
       WHERE g.grid_id = $1 AND g.user_id = $2
       FOR UPDATE`,
      [gridId, userId],
    );
    if (rows.length === 0) throw new HttpError(404, PUZZLE_NOT_FOUND);
    if (rows[0].is_shared) {
      throw new HttpError(409, `This puzzle has been shared, so it can't be ${action}.`);
    }
  }

  router.put("/me/grids/:gridId", withGridId, async (req, res) => {
    const puzzle = parsePuzzle(req.body);
    const { gridId } = req.params;
    const userId = req.user.user_id;
    await db.transaction(async (tx) => {
      await lockOwnUnsharedPuzzle(tx, gridId, userId, "edited");
      await tx.query(
        `UPDATE crossword_grids
         SET puzzle_title = $1, grid_size = $2, grid_values = $3, grid_numbers = $4,
             black_squares = $5, across_clues = $6, down_clues = $7, clue_number_directions = $8
         WHERE grid_id = $9 AND user_id = $10`,
        [
          puzzle.title,
          puzzle.size,
          puzzle.values,
          puzzle.numbers,
          puzzle.black,
          puzzle.acrossClues,
          puzzle.downClues,
          puzzle.directions,
          gridId,
          userId,
        ],
      );
    });
    res.json({ message: "Puzzle saved." });
  });

  router.delete("/me/grids/:gridId", withGridId, async (req, res) => {
    const { gridId } = req.params;
    const userId = req.user.user_id;
    await db.transaction(async (tx) => {
      await lockOwnUnsharedPuzzle(tx, gridId, userId, "deleted");
      await tx.query("DELETE FROM crossword_grids WHERE grid_id = $1 AND user_id = $2", [
        gridId,
        userId,
      ]);
    });
    res.status(204).end();
  });

  router.post(
    "/me/grids/:gridId/share",
    limiters.email,
    withGridId,
    validateShare,
    handleValidationErrors,
    async (req, res) => {
      const { gridId } = req.params;
      const { recipientUsername } = req.body;
      const userId = req.user.user_id;

      const recipient = await db.transaction(async (tx) => {
        const owned = await tx.query(
          "SELECT 1 FROM crossword_grids WHERE grid_id = $1 AND user_id = $2",
          [gridId, userId],
        );
        if (owned.rows.length === 0) throw new HttpError(404, PUZZLE_NOT_FOUND);

        const { rows } = await tx.query(
          "SELECT user_id, username, email FROM users WHERE username = $1",
          [recipientUsername],
        );
        const found = rows[0];
        if (!found) throw new HttpError(404, `There's no user named "${recipientUsername}".`);
        if (found.user_id === userId) throw new HttpError(400, "You can't share a puzzle with yourself.");
        if (!(await copyPuzzleToSolver(tx, gridId, found.user_id))) {
          throw new HttpError(409, `You've already shared this puzzle with ${found.username}.`);
        }
        return found;
      });

      runInBackground(
        mailer.sendSharingEmail(req.user.username, recipient.email, recipient.username),
        "sharing email",
      );
      res.status(201).json({ message: `Shared with ${recipient.username}.`, recipient: recipient.username });
    },
  );

  router.get("/me/solver/:gridId", withGridId, async (req, res) => {
    const { rows } = await db.query(
      `SELECT s.grid_id, s.puzzle_title, s.grid_size, s.grid_values, s.black_squares,
              s.across_clues, s.down_clues,
              COALESCE(s.completed_status, false) AS completed_status,
              u.username AS creator_username
       FROM solver_grids s
       JOIN crossword_grids g ON g.grid_id = s.grid_id
       JOIN users u ON u.user_id = g.user_id
       WHERE s.grid_id = $1 AND s.user_id = $2`,
      [req.params.gridId, req.user.user_id],
    );
    if (rows.length === 0) throw new HttpError(404, PUZZLE_NOT_FOUND);
    res.json(rows[0]);
  });

  // The answer key stays on the server. Saving and checking send the solver's letters here.
  async function loadSolverPuzzle(queryable, gridId, userId, { lock = false } = {}) {
    const { rows } = await queryable.query(
      `SELECT s.grid_size, s.black_squares, g.grid_values AS answer_key
       FROM solver_grids s
       JOIN crossword_grids g ON g.grid_id = s.grid_id
       WHERE s.grid_id = $1 AND s.user_id = $2
       ${lock ? "FOR UPDATE OF s" : ""}`,
      [gridId, userId],
    );
    if (rows.length === 0) throw new HttpError(404, PUZZLE_NOT_FOUND);
    return rows[0];
  }

  router.patch("/me/solver/:gridId", withGridId, async (req, res) => {
    const { gridId } = req.params;
    const userId = req.user.user_id;
    const completed = await db.transaction(async (tx) => {
      const puzzle = await loadSolverPuzzle(tx, gridId, userId, { lock: true });
      const values = parseSolverValues(req.body.gridValues, puzzle.grid_size, puzzle.black_squares);
      const solved = isSolved(values, puzzle.answer_key, puzzle.black_squares);
      await tx.query(
        `UPDATE solver_grids SET grid_values = $1, completed_status = $2
         WHERE grid_id = $3 AND user_id = $4`,
        [values, solved, gridId, userId],
      );
      return solved;
    });
    res.json({ completed });
  });

  router.post("/me/solver/:gridId/check", withGridId, async (req, res) => {
    const puzzle = await loadSolverPuzzle(db, req.params.gridId, req.user.user_id);
    const values = parseSolverValues(req.body.gridValues, puzzle.grid_size, puzzle.black_squares);
    res.json({ incorrect: incorrectCells(values, puzzle.answer_key, puzzle.black_squares) });
  });

  // Answers for the squares the solver asked to reveal, and no others.
  router.post("/me/solver/:gridId/reveal", withGridId, async (req, res) => {
    const puzzle = await loadSolverPuzzle(db, req.params.gridId, req.user.user_id);
    const cells = parseCellList(req.body.cells, puzzle.grid_size);
    const letters = cells
      .filter((cell) => !puzzle.black_squares[cell])
      .map((cell) => ({ cell, letter: normalizeLetter(puzzle.answer_key[cell]) }));
    res.json({ letters });
  });

  return router;
}
