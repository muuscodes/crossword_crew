// Gives the recipient their own blank copy of a puzzle to solve. Returns false if they already
// have one. The copy is built in SQL so the grid arrays never leave the database.
export async function copyPuzzleToSolver(tx, gridId, recipientId) {
  const { rows } = await tx.query(
    `INSERT INTO solver_grids
       (grid_id, user_id, completed_status, puzzle_title, grid_size, grid_values, grid_numbers,
        black_squares, across_clues, down_clues, clue_number_directions)
     SELECT grid_id, $2, false, puzzle_title, grid_size,
            array_fill(''::text, ARRAY[grid_size * grid_size]),
            grid_numbers, black_squares, across_clues, down_clues, clue_number_directions
     FROM crossword_grids
     WHERE grid_id = $1
     ON CONFLICT (grid_id, user_id) DO NOTHING
     RETURNING grid_id`,
    [gridId, recipientId],
  );
  return rows.length > 0;
}

// New accounts start with a copy of the welcome puzzle (WELCOME_GRID_ID), when it exists.
// A missing welcome puzzle never blocks sign-up.
export async function addWelcomePuzzle(tx, userId, welcomeGridId) {
  if (!welcomeGridId) return;
  const { rows } = await tx.query("SELECT user_id FROM crossword_grids WHERE grid_id = $1", [
    welcomeGridId,
  ]);
  if (rows.length === 0 || rows[0].user_id === userId) return;
  await copyPuzzleToSolver(tx, welcomeGridId, userId);
}
