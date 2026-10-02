import { body, param, validationResult } from "express-validator";
import {
  GRID_SIZES,
  assignNumbers,
  clueDirections,
  joinList,
  normalizeLetter,
  startsAcross,
  startsDown,
} from "../lib/crossword.js";
import { HttpError } from "../lib/errors.js";

// Column limits from the schema, so oversized input gets a 400 instead of a database error.
const MAX_USERNAME = 50;
const MAX_EMAIL = 100;
const MAX_TITLE = 100;
const MAX_CLUE = 200;
// bcrypt ignores everything after 72 bytes.
const MAX_PASSWORD = 72;
const MIN_PASSWORD = 6;

export function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const messages = [...new Set(result.array().map((error) => error.msg))];
  res.status(400).json({ message: messages.join(" ") });
}

const usernameField = (field, requiredMessage) =>
  body(field)
    .isString()
    .withMessage(requiredMessage)
    .bail()
    .trim()
    .isLength({ min: 1, max: MAX_USERNAME })
    .withMessage(`Usernames are 1 to ${MAX_USERNAME} characters.`);

const passwordField = (field, label) =>
  body(field)
    .isString()
    .withMessage(`${label} is required.`)
    .bail()
    .isLength({ min: MIN_PASSWORD, max: MAX_PASSWORD })
    .withMessage(`${label} must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.`);

const emailField = (field, maxLength) =>
  body(field)
    .isString()
    .withMessage("Email is required.")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .bail()
    .isLength({ max: maxLength })
    .withMessage(`Email addresses must be ${maxLength} characters or fewer.`)
    .toLowerCase();

export const validateSignup = [
  usernameField("username", "Username is required."),
  emailField("email", MAX_EMAIL),
  passwordField("password", "Password"),
];

export const validateLogin = [
  usernameField("username", "Username is required."),
  body("password").isString().notEmpty().withMessage("Password is required."),
];

export const validateChangePassword = [
  body("currentPassword").isString().notEmpty().withMessage("Current password is required."),
  passwordField("newPassword", "New password"),
];

export const validateUsernameChange = [usernameField("username", "Username is required.")];

// The current password is checked in the route, because Google-only accounts don't have one.
export const validateEmailChange = [
  emailField("email", MAX_EMAIL),
  body("currentPassword").optional().isString().withMessage("Current password is required."),
];

export const validateShare = [
  usernameField("recipientUsername", "Enter the username to share with."),
];

export const FEEDBACK_KINDS = ["bug", "feedback", "comment"];

export const validateFeedback = [
  body("kind").isIn(FEEDBACK_KINDS).withMessage("Choose whether this is a bug, feedback or a comment."),
  body("message")
    .isString()
    .withMessage("Write a message.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Messages are 1 to 5000 characters."),
  // Sent with bug reports, to help reproduce them.
  body("userAgent").optional({ values: "null" }).isString().bail().trim().isLength({ max: 500 }),
];

export const validateGridId = [
  param("gridId").isInt({ min: 1, max: 2147483647 }).withMessage("Puzzle not found.").toInt(),
];

const isTextOrNull = (value) => value === null || typeof value === "string";

// Titles and clues are stored without stray spaces: trimmed, with runs of spaces collapsed to one.
const tidyText = (text) => text.trim().replace(/\s+/g, " ");

function cellArray(value, length, isValid, label) {
  if (!Array.isArray(value) || value.length !== length || !value.every(isValid)) {
    throw new HttpError(400, `Invalid ${label}.`);
  }
  return value;
}

function parseLetters(value, size, black) {
  return cellArray(value, size * size, isTextOrNull, "grid letters").map((raw, index) => {
    const letter = black[index] ? "" : normalizeLetter(raw);
    if ([...letter].length > 1) throw new HttpError(400, "Each square holds a single letter.");
    return letter;
  });
}

// Validates a puzzle from the Create or Edit page and returns it ready to store. Clue numbers and
// directions are worked out here from the black squares instead of being trusted from the client,
// and clue text for squares that no longer start an entry is dropped.
export function parsePuzzle(input) {
  const size = input?.gridSize;
  if (!GRID_SIZES.includes(size)) {
    throw new HttpError(400, "Grid size must be 5, 7, 9, 11, 13 or 15.");
  }
  const cells = size * size;
  const black = cellArray(input.blackSquares, cells, (v) => typeof v === "boolean", "black squares");
  const values = parseLetters(input.gridValues, size, black);

  const parseClues = (key, startsEntry, label) =>
    cellArray(input[key], cells, isTextOrNull, label).map((clue, index) => {
      const text = startsEntry(black, size, index) && clue ? tidyText(clue) : "";
      if (text.length > MAX_CLUE) {
        throw new HttpError(400, `Clues must be ${MAX_CLUE} characters or fewer.`);
      }
      return text;
    });
  const acrossClues = parseClues("acrossClues", startsAcross, "across clues");
  const downClues = parseClues("downClues", startsDown, "down clues");

  const title = typeof input.puzzleTitle === "string" ? tidyText(input.puzzleTitle) : "";
  if (title.length > MAX_TITLE) {
    throw new HttpError(400, `Titles must be ${MAX_TITLE} characters or fewer.`);
  }

  const missing = [];
  if (!title) missing.push("a title");
  if (!values.some(Boolean)) missing.push("entries to the grid");
  if (!acrossClues.some(Boolean)) missing.push("across clues");
  if (!downClues.some(Boolean)) missing.push("down clues");
  if (missing.length > 0) throw new HttpError(400, `Please add ${joinList(missing)}.`);

  return {
    title,
    size,
    black,
    values,
    acrossClues,
    downClues,
    numbers: assignNumbers(black, size),
    directions: clueDirections(black, size),
  };
}

// Validates a solver's letters against the shape of their copy of the puzzle.
export function parseSolverValues(value, size, black) {
  return parseLetters(value, size, black);
}

// A list of square indexes, such as the squares to reveal. Repeats are dropped.
export function parseCellList(value, size) {
  const cells = size * size;
  const valid =
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= cells &&
    value.every((cell) => Number.isInteger(cell) && cell >= 0 && cell < cells);
  if (!valid) throw new HttpError(400, "Invalid squares.");
  return [...new Set(value)];
}
