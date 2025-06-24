import { Router } from "express";
const router = Router();
// import { none, any, one } from "./db.js";

// Create a new record
router.post("/records", async (req, res, next) => {
  try {
    const { name, age } = req.body;
    const record = await none("INSERT INTO records(name, age) VALUES($1, $2)", [
      name,
      age,
    ]);
    res.json({
      message: "Record created successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get all records
router.get("/records", async (req, res, next) => {
  try {
    const records = await any("SELECT * FROM records");
    res.json(records);
  } catch (error) {
    next(error);
  }
});

// Get a single record by ID
router.get("/records/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await one("SELECT * FROM records WHERE id = $1", id);
    res.json(record);
  } catch (error) {
    next(error);
  }
});

// Update a record by ID
router.put("/records/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, age } = req.body;
    const record = await none(
      "UPDATE records SET name = $1, age = $2 WHERE id = $3",
      [name, age, id]
    );
    res.json({
      message: "Record updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Delete a record by ID
router.delete("/records/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await none("DELETE FROM records WHERE id = $1", id);
    res.json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
