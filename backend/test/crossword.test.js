import { describe, expect, test } from "vitest";
import {
  assignNumbers,
  clueDirections,
  incorrectCells,
  isSolved,
  joinList,
} from "../src/lib/crossword.js";
import { parsePuzzle } from "../src/middleware/validation.js";
import { samplePuzzle } from "./helpers.js";

const empty = (size) => Array(size * size).fill(false);

describe("assignNumbers", () => {
  test("numbers the top row and left column of an open grid", () => {
    expect(assignNumbers(empty(3), 3)).toEqual([1, 2, 3, 4, null, null, 5, null, null]);
  });

  test("numbers squares after black squares, in reading order", () => {
    const black = empty(3);
    black[1] = true;
    // # at (0,1): (0,2) starts across and down, (1,1) starts down under the black square.
    expect(assignNumbers(black, 3)).toEqual([1, null, 2, 3, 4, null, 5, null, null]);
  });
});

describe("clueDirections", () => {
  test("marks which entries each square starts", () => {
    const black = empty(3);
    black[1] = true;
    const directions = clueDirections(black, 3);
    expect(directions[0]).toEqual(["across", "down"]);
    expect(directions[2]).toEqual(["across", "down"]);
    expect(directions[4]).toEqual(["", "down"]);
    expect(directions[3]).toEqual(["across", ""]);
    expect(directions[8]).toEqual(["", ""]);
  });
});

describe("answer checking", () => {
  const black = [false, true, false, false];
  const key = ["A", "", "B", "C"];

  test("isSolved ignores black squares and letter case", () => {
    expect(isSolved(["a", "", "B", " c "], key, black)).toBe(true);
    expect(isSolved(["A", "", "B", ""], key, black)).toBe(false);
  });

  test("incorrectCells reports only filled squares that are wrong", () => {
    expect(incorrectCells(["A", "", "X", ""], key, black)).toEqual([2]);
  });
});

test("joinList reads naturally", () => {
  expect(joinList(["a title"])).toBe("a title");
  expect(joinList(["a title", "across clues"])).toBe("a title and across clues");
  expect(joinList(["a", "b", "c"])).toBe("a, b, and c");
});

describe("parsePuzzle", () => {
  test("computes numbers and directions on the server and normalizes letters", () => {
    const puzzle = parsePuzzle(samplePuzzle({ gridValues: samplePuzzle().gridValues.map((v) => v.toLowerCase()) }));
    expect(puzzle.values[0]).toBe("A");
    expect(puzzle.values[4]).toBe("");
    expect(puzzle.numbers[0]).toBe(1);
    expect(puzzle.directions[0]).toEqual(["across", "down"]);
  });

  test("drops clue text for squares that don't start an entry", () => {
    const input = samplePuzzle();
    input.acrossClues[1] = "stale clue left behind";
    expect(parsePuzzle(input).acrossClues[1]).toBe("");
  });

  test("lists everything a puzzle is missing", () => {
    const blank = samplePuzzle({
      puzzleTitle: " ",
      gridValues: Array(25).fill(""),
      acrossClues: Array(25).fill(""),
      downClues: Array(25).fill(""),
    });
    expect(() => parsePuzzle(blank)).toThrow(
      "Please add a title, entries to the grid, across clues, and down clues.",
    );
  });

  test("rejects malformed grids", () => {
    expect(() => parsePuzzle(samplePuzzle({ gridSize: 6 }))).toThrow("Grid size");
    expect(() => parsePuzzle(samplePuzzle({ blackSquares: [true] }))).toThrow("Invalid black squares");
    const twoLetters = samplePuzzle();
    twoLetters.gridValues[0] = "AB";
    expect(() => parsePuzzle(twoLetters)).toThrow("single letter");
    expect(() => parsePuzzle(samplePuzzle({ puzzleTitle: "x".repeat(101) }))).toThrow("Titles");
  });
});
