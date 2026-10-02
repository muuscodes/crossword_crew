import { describe, expect, test } from "vitest";
import {
  assignNumbers,
  clueStarts,
  moveFrom,
  nextClueStart,
  puzzlePayload,
  puzzleProblems,
  tidyText,
  toGridLetter,
  wordCells,
} from "../lib/crossword";

const grid = (size: number, ...blackCells: number[]) => {
  const black = Array(size * size).fill(false);
  blackCells.forEach((cell) => (black[cell] = true));
  return black;
};

describe("assignNumbers", () => {
  test("numbers squares that start an entry, in reading order", () => {
    expect(assignNumbers(grid(3), 3)).toEqual([1, 2, 3, 4, null, null, 5, null, null]);
    expect(assignNumbers(grid(3, 1), 3)).toEqual([1, null, 2, 3, 4, null, 5, null, null]);
  });

  test("lists clue starts for each direction", () => {
    expect(clueStarts(grid(3, 1), 3, "across")).toEqual([0, 2, 3, 6]);
    expect(clueStarts(grid(3, 1), 3, "down")).toEqual([0, 2, 4]);
  });
});

test("wordCells stops at black squares and the edge of the grid", () => {
  const black = grid(5, 2);
  expect(wordCells(black, 5, 0, "across")).toEqual([0, 1]);
  expect(wordCells(black, 5, 4, "across")).toEqual([3, 4]);
  expect(wordCells(black, 5, 12, "down")).toEqual([7, 12, 17, 22]);
  expect(wordCells(black, 5, 5, "across")).toEqual([5, 6, 7, 8, 9]);
});

describe("moveFrom", () => {
  test("left and right follow reading order, wrap and skip black squares", () => {
    const black = grid(5, 1);
    expect(moveFrom(black, 5, 0, "right")).toBe(2);
    expect(moveFrom(black, 5, 24, "right")).toBe(0);
    expect(moveFrom(black, 5, 0, "left")).toBe(24);
  });

  test("down from the bottom of a column goes to the top of the next one on any grid size", () => {
    // Used to be hard-coded for 5x5 grids.
    expect(moveFrom(grid(7), 7, 6 * 7 + 4, "down")).toBe(5);
    expect(moveFrom(grid(7), 7, 48, "down")).toBe(0);
  });

  test("up from the top of a column goes to the bottom of the previous one", () => {
    expect(moveFrom(grid(7), 7, 3, "up")).toBe(6 * 7 + 2);
  });

  test("wraps from one end of the grid to the other when the corner squares are black", () => {
    const black = grid(5, 0, 24);
    expect(moveFrom(black, 5, 19, "down")).toBe(5);
    expect(moveFrom(black, 5, 5, "up")).toBe(19);
    expect(moveFrom(black, 5, 23, "right")).toBe(1);
    expect(moveFrom(black, 5, 1, "left")).toBe(23);
  });

  test("skips columns that are entirely black", () => {
    const black = grid(5, 1, 6, 11, 16, 21);
    expect(moveFrom(black, 5, 20, "down")).toBe(2);
    expect(moveFrom(black, 5, 2, "up")).toBe(20);
  });
});

test("nextClueStart steps through clues in order and wraps", () => {
  const black = grid(5);
  expect(nextClueStart(black, 5, 7, "across", true)).toBe(10);
  expect(nextClueStart(black, 5, 7, "across", false)).toBe(0);
  expect(nextClueStart(black, 5, 12, "down", true)).toBe(3);
  expect(nextClueStart(black, 5, 4, "down", true)).toBe(0);
  expect(nextClueStart(black, 5, 0, "across", false)).toBe(20);
});

describe("puzzleProblems", () => {
  const base = () => ({
    title: "Title",
    size: 5,
    black: grid(5, 1),
    values: Array(25).fill(""),
    acrossClues: Array(25).fill(""),
    downClues: Array(25).fill(""),
  });

  test("lists everything that's missing", () => {
    expect(puzzleProblems({ ...base(), title: " " })).toBe(
      "Please add a title, entries to the grid, across clues, and down clues.",
    );
  });

  test("ignores clue text left on squares that no longer start an entry", () => {
    const content = base();
    content.values[0] = "A";
    content.downClues[0] = "Down";
    // Square 7 is mid-entry, so text stored there belongs to no clue.
    content.acrossClues[7] = "Left behind";
    expect(puzzleProblems(content)).toBe("Please add across clues.");
    // Square 2 sits right of the black square, so it starts an across entry.
    content.acrossClues[2] = "Real clue";
    expect(puzzleProblems(content)).toBeNull();
  });
});

test("puzzlePayload drops letters on black squares, trims clues and drops stale ones", () => {
  const black = grid(5, 1);
  const values = Array(25).fill("");
  values[1] = "X";
  values[0] = "A";
  const acrossClues = Array(25).fill("");
  acrossClues[0] = "  Spaced  ";
  acrossClues[3] = "Stale";
  const payload = puzzlePayload({ title: " T ", size: 5, black, values, acrossClues, downClues: Array(25).fill("") });
  expect(payload.puzzleTitle).toBe("T");
  expect(payload.gridValues.slice(0, 2)).toEqual(["A", ""]);
  expect(payload.acrossClues[0]).toBe("Spaced");
  expect(payload.acrossClues[3]).toBe("");
});

test("tidyText trims and collapses runs of spaces", () => {
  expect(tidyText("  Big \t  cat\n")).toBe("Big cat");
  expect(tidyText("   ")).toBe("");
});

test("toGridLetter accepts one letter or digit", () => {
  expect(toGridLetter("a")).toBe("A");
  expect(toGridLetter("7")).toBe("7");
  expect(toGridLetter("é")).toBe("É");
  expect(toGridLetter("!")).toBeNull();
  expect(toGridLetter("Tab")).toBeNull();
});
