import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

// JWT middleware
export const jwtMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send({ message: "Token not verified" });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).send({ message: "User unauthorized" });
  }
};

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    return res.status(400).send({ message: errorMessages });
  }
  next();
};

// Validation rules for signing up
export const validateAddUser = [
  body("username").isString().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Validation rules for logging in
export const validateGetUser = [
  body("username").isString().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for adding a crossword grid (solver or normal)
export const validateAddCrosswordGrid = [
  body("puzzleTitle").notEmpty().withMessage("Puzzle title is required"),
  body("currentGridValues")
    .isArray()
    .withMessage("Grid values must be an array")
    .custom((value) => {
      if (
        value &&
        value.some((item) => typeof item === "string" && item.trim() !== "")
      ) {
        return true;
      }
      throw new Error("At least one grid value must be a non-empty string");
    }),
  body("acrossClueValues")
    .isArray()
    .withMessage("Across clues must be an array")
    .custom((value) => {
      if (
        value &&
        value.some((item) => typeof item === "string" && item.trim() !== "")
      ) {
        return true;
      }
      throw new Error("At least one across clue must be a non-empty string");
    }),
  body("downClueValues")
    .isArray()
    .withMessage("Down clues must be an array")
    .custom((value) => {
      if (
        value &&
        value.some((item) => typeof item === "string" && item.trim() !== "")
      ) {
        return true;
      }
      throw new Error("At least one down clue must be a non-empty string");
    }),
];

// Validation rules for sharing a crossword
export const validateShareCrossword = [
  body("recipientUsername").isString().withMessage("Username is required"),
];

// Validation rules for contact form
export const validateContactForm = [
  body("name").isString().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("message").isString().withMessage("Please provide a message"),
];

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  handler: (req, res) => {
    return res.status(429).send({
      message: "Too many login attempts, please try again in 5 minutes.",
    });
  },
});

export const validateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).send({ message: "Not authenticated" });
  }
};
