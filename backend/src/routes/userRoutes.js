import { Router } from "express";
import { pool } from "../db.js";
const router = Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Get a user by username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Add a user
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, password]
    );
    res.status(201).send({
      message: "Successfully added users",
    });
  } catch (error) {
    console.log("Something is amiss", error);
    res.sendStatus(500);
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
    res.status(203).send({
      message: "Successfully updated password",
    });
  } catch (error) {
    console.log("Error updating user password: ", error);
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
      gridSize,
      currentGridValues,
      currentGridNumbers,
      blackSquares,
      acrossClueValues,
      downClueValues,
      clueNumDirection,
    } = req.body;
    await pool.query(
      `INSERT INTO crossword_grids 
    (grid_size, grid_values, grid_numbers, black_squares, 
        across_clues, down_clues, clue_number_directions) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        gridSize,
        currentGridValues,
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

export default router;
