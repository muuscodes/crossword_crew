import { Router } from "express";
import { pool } from "../db.js";
const router = Router();
import {
  jwtMiddleware,
  handleValidationErrors,
  validateAddCrosswordGrid,
  validateShareCrossword,
} from "../middleware/validationMiddleware.js";
import { sendSharingEmail } from "./emailRoutes.js";

// Get user by username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Add crossword grid to database from create
router.post(
  "/:userId/grids/add",
  jwtMiddleware,
  validateAddCrosswordGrid,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        puzzleTitle,
        gridSize,
        currentGridValues,
        currentGridNumbers,
        blackSquares,
        acrossClueValues,
        downClueValues,
        clueNumDirection,
      } = req.body;

      // Insert into the crossword_grids table
      const result = await pool.query(
        `INSERT INTO crossword_grids
    (user_id, puzzle_title, grid_size, grid_values, grid_numbers, black_squares,
        across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING grid_id`,
        [
          userId,
          puzzleTitle,
          gridSize,
          currentGridValues,
          currentGridNumbers,
          blackSquares,
          acrossClueValues,
          downClueValues,
          clueNumDirection,
        ]
      );

      // Insert into the user's library
      await pool.query(
        `INSERT INTO user_library
    (user_id, crossword_grid_id) VALUES ($1, $2)`,
        [userId, result.rows[0].grid_id]
      );

      return res.status(201).send({
        message: "Successfully added crossword grid",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Share crossword grid with a friend
router.post(
  "/:userId/grids/:gridId/share",
  jwtMiddleware,
  validateShareCrossword,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, gridId } = req.params;
      const { recipientUsername } = req.body;

      // Get grid data from the crossword_grids table
      const gridData = await pool.query(
        "SELECT * FROM crossword_grids WHERE user_id = $1 AND grid_id = $2",
        [userId, gridId]
      );
      if (gridData.rows.length === 0) {
        return res.status(404).send({ message: "Grid data not found" });
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

      // Get the sender's username
      const senderResult = await pool.query(
        `SELECT * FROM users WHERE user_id = $1`,
        [userId]
      );

      if (senderResult.rows.length === 0) {
        return res.status(404).send({ message: "Sender user not found" });
      }

      const senderUsername = senderResult.rows[0].username;

      // Get the recipient's user_id
      const recipientResult = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [recipientUsername]
      );

      if (recipientResult.rows.length === 0) {
        return res.status(404).send({ message: "Recipient user not found" });
      }

      const recipientUserId = recipientResult.rows[0].user_id;
      const recipientEmail = recipientResult.rows[0].email;

      // Insert into the solver_grids table
      const result = await pool.query(
        `INSERT INTO solver_grids
        (grid_id, user_id, completed_status, puzzle_title, grid_size, grid_values, grid_numbers, black_squares, across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          gridId,
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

      // Insert into the user's library
      await pool.query(
        `INSERT INTO user_library
    (user_id, solver_grid_id) VALUES ($1, $2)`,
        [recipientUserId, gridId]
      );

      // Send email to notify recipient
      await sendSharingEmail(senderUsername, recipientEmail, recipientUsername);

      return res.status(200).send({
        message: "Successfully shared grid",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Home page count number of grids
router.get("/:userId/grids/count", async (req, res) => {
  try {
    const { userId } = req.params;
    const totalPuzzles = await pool.query(
      "SELECT COUNT(*) FROM user_library WHERE user_id = $1",
      [userId]
    );
    const createdByUser = await pool.query(
      "SELECT COUNT(*) FROM user_library WHERE user_id = $1 AND crossword_grid_id IS NOT NULL",
      [userId]
    );
    const createdByOther = await pool.query(
      "SELECT COUNT(*) FROM user_library WHERE user_id = $1 AND solver_grid_id IS NOT NULL",
      [userId]
    );
    const solvedPuzzles = await pool.query(
      "SELECT COUNT(*) FROM solver_grids WHERE user_id = $1 AND completed_status = $2",
      [userId, true]
    );

    const result = {
      totalPuzzleCount: totalPuzzles.rows[0].count,
      createdByUserCount: createdByUser.rows[0].count,
      createdByOtherCount: createdByOther.rows[0].count,
      solvedPuzzleCount: solvedPuzzles.rows[0].count,
    };

    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Get a user's crosswords for library
router.get("/:userId/grids", jwtMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `WITH
      crossword_grid_data AS (
        SELECT cg.*, u.username
        FROM user_library l
        JOIN crossword_grids cg ON l.crossword_grid_id = cg.grid_id
        JOIN users u ON l.user_id = u.user_id
        WHERE l.user_id = $1 AND l.crossword_grid_id IS NOT NULL
      ),
      solver_grid_data AS (
        SELECT sg.*, creator.username AS creator_username 
        FROM user_library l
        JOIN solver_grids sg ON l.solver_grid_id = sg.grid_id AND sg.user_id = $1
        JOIN users solver ON sg.user_id = solver.user_id 
        JOIN user_library creator_lib ON sg.grid_id = creator_lib.crossword_grid_id AND creator_lib.solver_grid_id IS NULL
        JOIN users creator ON creator_lib.user_id = creator.user_id 
        WHERE l.user_id = $1 AND l.solver_grid_id IS NOT NULL
      )
      SELECT
      (SELECT json_agg(crossword_grid_data) FROM crossword_grid_data) AS crossword_grids,
      (SELECT json_agg(solver_grid_data) FROM solver_grid_data) AS solver_grids;
      `,
      [userId]
    );
    const crosswordData = result.rows[0];

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "Unable to retrieve crossword data" });
    }
    return res.status(200).send(crosswordData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Get an editor's crossword
router.get("/:userId/editor/:gridId", jwtMiddleware, async (req, res) => {
  try {
    const { userId, gridId } = req.params;
    const result = await pool.query(
      "SELECT * FROM crossword_grids WHERE user_id = $1 AND grid_id = $2",
      [userId, gridId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Crossword not found" });
    }
    return res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Save editor progress
router.put(
  "/editor/:gridId",
  jwtMiddleware,
  validateAddCrosswordGrid,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { gridId } = req.params;
      const {
        puzzleTitle,
        gridSize,
        currentGridValues,
        currentGridNumbers,
        blackSquares,
        acrossClueValues,
        downClueValues,
        clueNumDirection,
      } = req.body;

      const result = await pool.query(
        `SELECT * FROM solver_grids WHERE grid_id = $1`,
        [gridId]
      );

      if (result.rows.length !== 0) {
        return res
          .status(403)
          .send({ message: "Cannot edit a shared crossword" });
      }
      await pool.query(
        `UPDATE crossword_grids
      SET puzzle_title = $1, grid_size = $2, grid_values = $3, grid_numbers = $4, black_squares = $5,
        across_clues = $6, down_clues = $7, clue_number_directions = $8
      WHERE grid_id = $9`,
        [
          puzzleTitle,
          gridSize,
          currentGridValues,
          currentGridNumbers,
          blackSquares,
          acrossClueValues,
          downClueValues,
          clueNumDirection,
          gridId,
        ]
      );
      return res.status(200).send({
        message: "Successfully updated crossword grid",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

// Get a solver's crosswords for solving
router.get("/:userId/solver/:gridId", jwtMiddleware, async (req, res) => {
  try {
    const { userId, gridId } = req.params;
    const result = await pool.query(
      `SELECT *
        FROM solver_grids
        WHERE user_id = $1 AND grid_id = $2`,
      [userId, gridId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Grid not found" });
    }
    return res.status(200).send(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Get the answer key for a specific crossword
router.get("/:userId/grids/:gridId", jwtMiddleware, async (req, res) => {
  try {
    const { userId, gridId } = req.params;

    // Find the creator's user_id using the gridId
    const creatorResult = await pool.query(
      `SELECT l.user_id
       FROM user_library l
       WHERE l.crossword_grid_id = $1 AND l.solver_grid_id IS NULL`,
      [gridId]
    );

    if (creatorResult.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "Creator not found for this grid" });
    }

    const creatorUserId = creatorResult.rows[0].user_id;

    // Use creator's user_id to get the crossword grid
    const gridResult = await pool.query(
      `SELECT * FROM crossword_grids WHERE user_id = $1 AND grid_id = $2`,
      [creatorUserId, gridId]
    );

    if (gridResult.rows.length === 0) {
      return res.status(404).send({ message: "Grid not found" });
    }

    return res.status(200).send(gridResult.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Save solver progress
router.patch("/solver/:gridId", jwtMiddleware, async (req, res) => {
  try {
    const { gridId } = req.params;
    const { currentGridValues, completed } = req.body;

    // Update the solver_grids table
    await pool.query(
      `UPDATE solver_grids 
      SET completed_status = $1, grid_values = $2
      WHERE grid_id = $3`,
      [completed, currentGridValues, gridId]
    );
    return res.status(201).send({
      message: "Successfully added crossword grid",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Delete a grid by grid id
router.delete("/:userId/delete/:gridId", jwtMiddleware, async (req, res) => {
  try {
    const { userId, gridId } = req.params;

    // Check if the grid exists
    const checkGridExists = await pool.query(
      `SELECT * FROM crossword_grids WHERE grid_id = $1`,
      [gridId]
    );

    if (checkGridExists.rows.length === 0) {
      return res.status(404).json({ message: "Grid not found" });
    }

    // Check if grid was shared
    const result = await pool.query(
      `SELECT * FROM solver_grids WHERE grid_id = $1`,
      [gridId]
    );

    if (result.rows.length !== 0) {
      return res
        .status(403)
        .send({ message: "Can not delete a shared crossword" });
    }

    // Delete from crossword grids
    await pool.query(`DELETE FROM crossword_grids WHERE grid_id = $1`, [
      gridId,
    ]);

    // Delete from user library
    await pool.query(
      `DELETE FROM user_library WHERE user_id = $1 AND crossword_grid_id = $2`,
      [userId, gridId]
    );

    return res.status(200).send({
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
