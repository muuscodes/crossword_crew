import { body, param, validationResult } from "express-validator";

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for adding a user
export const validateAddUser = [
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Validation rules for getting a user by username
export const validateGetUser = [
  param("username").isString().notEmpty().withMessage("Username is required"),
];

// Validation rules for updating a user password
export const validateUpdatePassword = [
  param("username").isString().notEmpty().withMessage("Username is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Validation rules for deleting a user
export const validateDeleteUser = [
  param("username").isString().notEmpty().withMessage("Username is required"),
];

// Validation rules for adding a crossword grid
export const validateAddCrosswordGrid = [
  body("userid").isInt().withMessage("User ID must be an integer"),
  body("completed")
    .isBoolean()
    .withMessage("Completed status must be a boolean"),
  body("puzzleTitle")
    .isString()
    .notEmpty()
    .withMessage("Puzzle title is required"),
  body("gridSize")
    .isInt({ min: 1 })
    .withMessage("Grid size must be a positive integer"),
  // Add more validations for other fields as needed
];
