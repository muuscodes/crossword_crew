import { Router } from "express";
import { pool } from "../db.js";
const router = Router();

// Get all user info
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Get a user info by username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      res.status(404).send({ message: "User not found" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Update a user password
router.patch("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.body;
    await pool.query("UPDATE users SET password = $1 WHERE username = $2", [
      password,
      username,
    ]);
    res.status(204).send({
      message: "Successfully updated password",
    });
  } catch (error) {
    console.log("Error updating user password: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a user by username
router.delete("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    await pool.query("DELETE FROM users WHERE username = $1", [username]);
    res.json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.log("No deleting today", error);
    res.sendStatus(500);
  }
});

// Add crossword grid to database
router.post("/grids", async (req, res) => {
  try {
    const {
      userId,
      completed,
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
    await pool.query(
      `INSERT INTO crossword_grids_test 
    (userid_creator, completed_status, puzzle_title, grid_size, grid_values, grid_numbers, black_squares, 
        across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        completed,
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

    // Insert into the solver_grids table
    const cleanGridValues = Array(gridSize * gridSize).fill("");
    await pool.query(
      `INSERT INTO solver_grids_test 
    (userid_creator, completed_status, puzzle_title, grid_size, grid_values, grid_numbers, black_squares, 
        across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
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
    res.status(201).send({
      message: "Successfully added crossword grid",
    });
  } catch (error) {
    console.log("Something is amiss", error);
    res.sendStatus(500);
  }
});

// Get a user's crosswords for library
router.get("/:userId/grids", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT cg.*, u.username 
       FROM crossword_grids_test cg
       JOIN users u ON cg.userid_creator = u.userid
       WHERE cg.userid_creator = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const gridsWithUsernames = result.rows.map((row) => ({
      ...row,
      username: row.username,
    }));
    res.json(gridsWithUsernames);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Get the answer key for a specific crossword
router.get("/:userId/grids/:gridId", async (req, res) => {
  try {
    const { userId, gridId } = req.params;
    const result = await pool.query(
      "SELECT * FROM crossword_grids_test WHERE userid_creator = $1 AND grid_id = $2",
      [userId, gridId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Get a solver's crosswords for solving
router.get("/:userId/solver/:gridId", async (req, res) => {
  try {
    const { userId, gridId } = req.params;
    const result = await pool.query(
      "SELECT * FROM solver_grids_test WHERE userid_creator = $1 AND grid_id = $2",
      [userId, gridId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Save solver progress
router.post("/solver/:gridId", async (req, res) => {
  try {
    const { gridId } = req.params;
    const { currentGridValues, completed } = req.body;

    // Update the solver_grids table
    await pool.query(
      `UPDATE solver_grids_test 
      SET completed_status = $1, grid_values = $2
      WHERE grid_id = $3`,
      [completed, currentGridValues, gridId]
    );
    res.status(201).send({
      message: "Successfully added crossword grid",
    });
  } catch (error) {
    console.log("Something is amiss", error);
    res.sendStatus(500);
  }
});

export default router;
