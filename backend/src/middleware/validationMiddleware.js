import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for signing up
export const validateAddUser = [
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("email").isEmail().notEmpty().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .notEmpty()
    .withMessage("Password must be at least 6 characters long"),
];

// Validation rules for logging in
export const validateGetUser = [
  body("username").isString().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for adding a crossword grid (solver or normal)
export const validateAddCrosswordGrid = [
  body("puzzleTitle").notEmpty().withMessage("Puzzle title is required"),
  body("currentGridValues")
    .isArray() // Check if it's an array
    .withMessage("Grid values must be an array")
    .custom((value) => {
      // Check if at least one item in the array is a non-empty string
      if (
        value &&
        value.some((item) => typeof item === "string" && item.trim() !== "")
      ) {
        return true; // At least one valid entry
      }
      throw new Error("At least one grid value must be a non-empty string");
    }),
  body("acrossClueValues")
    .isArray() // Check if it's an array
    .withMessage("Across clues must be an array")
    .custom((value) => {
      // Check if at least one item in the array is a non-empty string
      if (
        value &&
        value.some((item) => typeof item === "string" && item.trim() !== "")
      ) {
        return true; // At least one valid entry
      }
      throw new Error("At least one across clue must be a non-empty string");
    }),
  body("downClueValues")
    .isArray() // Check if it's an array
    .withMessage("Down clues must be an array")
    .custom((value) => {
      // Check if at least one item in the array is a non-empty string
      if (
        value &&
        value.some((item) => typeof item === "string" && item.trim() !== "")
      ) {
        return true; // At least one valid entry
      }
      throw new Error("At least one down clue must be a non-empty string");
    }),
];

// Validation rules for sharing a crossword
export const validateShareCrossword = [
  body("recipientUsername")
    .isString()
    .notEmpty()
    .withMessage("Username is required"),
];

// Validation rules for contact form
export const validateContactForm = [
  body("name").isString().notEmpty().withMessage("Username is required"),
  body("email").isEmail().notEmpty().withMessage("Invalid email format"),
  body("message").isString().notEmpty().withMessage("Please provide a message"),
];

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    message: "Too many login attempts, please try again in 5 minutes.",
  },
});

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};
