import { useMemo, useReducer } from "react";
import type { PuzzleRecord } from "../components/utils/types";
import { assignNumbers, clueStarts, wordCells, wordStart } from "./crossword";
import { type PuzzleGrid, crosswordReducer, emptyCrossword } from "./crosswordReducer";

// Board state plus everything derived from it that the grid and clue lists need.
export function useCrossword(initialSize = 5) {
  const [state, dispatch] = useReducer(crosswordReducer, initialSize, emptyCrossword);
  const { black, size, selection } = state;

  const numbers = useMemo(() => assignNumbers(black, size), [black, size]);
  const acrossStarts = useMemo(() => clueStarts(black, size, "across"), [black, size]);
  const downStarts = useMemo(() => clueStarts(black, size, "down"), [black, size]);
  const activeWord = useMemo(
    () => new Set(selection ? wordCells(black, size, selection.cell, selection.direction) : []),
    [black, size, selection],
  );
  // The clue being typed, and the clue that crosses it at the selected square.
  const activeClue = selection
    ? { index: wordStart(black, size, selection.cell, selection.direction), direction: selection.direction }
    : null;
  const crossingDirection = selection?.direction === "across" ? "down" : "across";
  const crossingClue = selection
    ? { index: wordStart(black, size, selection.cell, crossingDirection), direction: crossingDirection }
    : null;

  return { state, dispatch, numbers, acrossStarts, downStarts, activeWord, activeClue, crossingClue };
}

export type CrosswordModel = ReturnType<typeof useCrossword>;

// Turns a puzzle from the API into board state, filling any gaps left by older saved data.
export function puzzleGridFromRecord(record: PuzzleRecord): PuzzleGrid {
  const cells = record.grid_size * record.grid_size;
  const fit = <T,>(list: readonly (T | null)[] | null, fallback: T): T[] =>
    Array.from({ length: cells }, (_, index) => list?.[index] ?? fallback);
  return {
    size: record.grid_size,
    black: fit(record.black_squares, false),
    values: fit(record.grid_values, ""),
    acrossClues: fit(record.across_clues, ""),
    downClues: fit(record.down_clues, ""),
  };
}
