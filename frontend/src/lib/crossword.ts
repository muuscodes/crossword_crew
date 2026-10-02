// Grid rules for every crossword screen. Cells are stored row by row, so the square at
// (row, col) lives at index row * size + col. The backend applies the same rules in
// backend/src/lib/crossword.js.

export const GRID_SIZES = [5, 7, 9, 11, 13, 15] as const;

export type Direction = "across" | "down";
export type Move = "left" | "right" | "up" | "down";

export function startsAcross(black: readonly boolean[], size: number, index: number): boolean {
  return !black[index] && (index % size === 0 || black[index - 1]);
}

export function startsDown(black: readonly boolean[], size: number, index: number): boolean {
  return !black[index] && (index < size || black[index - size]);
}

export function startsEntry(
  black: readonly boolean[],
  size: number,
  index: number,
  direction: Direction,
): boolean {
  return direction === "across" ? startsAcross(black, size, index) : startsDown(black, size, index);
}

// Clue numbers, in reading order, for every square that starts an across or down entry.
export function assignNumbers(black: readonly boolean[], size: number): (number | null)[] {
  const numbers: (number | null)[] = Array(size * size).fill(null);
  let next = 1;
  for (let index = 0; index < size * size; index++) {
    if (startsAcross(black, size, index) || startsDown(black, size, index)) {
      numbers[index] = next++;
    }
  }
  return numbers;
}

// Squares that start an entry in the given direction, in clue-list order.
export function clueStarts(black: readonly boolean[], size: number, direction: Direction): number[] {
  const starts: number[] = [];
  for (let index = 0; index < size * size; index++) {
    if (startsEntry(black, size, index, direction)) starts.push(index);
  }
  return starts;
}

// Every square in the entry that runs through index.
export function wordCells(
  black: readonly boolean[],
  size: number,
  index: number,
  direction: Direction,
): number[] {
  if (black[index]) return [];
  const step = direction === "across" ? 1 : size;
  const onSameLine = (from: number, to: number) =>
    direction === "down" || Math.floor(from / size) === Math.floor(to / size);
  const inGrid = (cell: number) => cell >= 0 && cell < size * size;

  let start = index;
  while (inGrid(start - step) && onSameLine(start, start - step) && !black[start - step]) {
    start -= step;
  }
  const cells: number[] = [];
  for (let cell = start; inGrid(cell) && onSameLine(start, cell) && !black[cell]; cell += step) {
    cells.push(cell);
  }
  return cells;
}

export function wordStart(
  black: readonly boolean[],
  size: number,
  index: number,
  direction: Direction,
): number {
  return wordCells(black, size, index, direction)[0] ?? index;
}

// The next white square in a direction, wrapping around the grid and skipping black squares.
// Left and right move in reading order. Up and down move down each column and then on to the
// top of the next one, so a fully black column is skipped instead of blocking the cursor.
export function moveFrom(black: readonly boolean[], size: number, index: number, move: Move): number {
  const cells = size * size;
  const forward = move === "right" || move === "down";
  const byColumn = move === "up" || move === "down";
  // Position of index in the order we walk through the grid.
  const position = byColumn ? (index % size) * size + Math.floor(index / size) : index;

  for (let step = 1; step < cells; step++) {
    const next = (position + (forward ? step : -step) + cells) % cells;
    const cell = byColumn ? (next % size) * size + Math.floor(next / size) : next;
    if (!black[cell]) return cell;
  }
  return index;
}

// The first square of the next (or previous) clue in a direction, wrapping around.
export function nextClueStart(
  black: readonly boolean[],
  size: number,
  index: number,
  direction: Direction,
  forward: boolean,
): number {
  const starts = clueStarts(black, size, direction);
  if (starts.length === 0) return index;
  const current = wordStart(black, size, index, direction);
  if (forward) return starts.find((start) => start > current) ?? starts[0];
  return [...starts].reverse().find((start) => start < current) ?? starts[starts.length - 1];
}

// "a", "a and b", "a, b, and c"
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Titles and clues are saved without stray spaces: trimmed, with runs of spaces collapsed to one.
export function tidyText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export interface PuzzleContent {
  title: string;
  size: number;
  black: readonly boolean[];
  values: readonly string[];
  acrossClues: readonly string[];
  downClues: readonly string[];
}

// Clue text, keeping only squares that still start an entry. Text typed for a square that later
// stopped starting an entry stays in the editor's state but isn't saved.
export function cluesToSave(content: PuzzleContent, direction: Direction): string[] {
  const clues = direction === "across" ? content.acrossClues : content.downClues;
  return clues.map((clue, index) =>
    startsEntry(content.black, content.size, index, direction) ? tidyText(clue) : "",
  );
}

// What a puzzle still needs before it can be saved, as a sentence, or null when it's ready.
// Mirrors the server's check so people get instant feedback.
export function puzzleProblems(content: PuzzleContent): string | null {
  const missing: string[] = [];
  if (!tidyText(content.title)) missing.push("a title");
  if (!content.values.some((value, index) => value && !content.black[index])) {
    missing.push("entries to the grid");
  }
  if (!cluesToSave(content, "across").some(Boolean)) missing.push("across clues");
  if (!cluesToSave(content, "down").some(Boolean)) missing.push("down clues");
  return missing.length > 0 ? `Please add ${joinList(missing)}.` : null;
}

// The request body the backend expects for creating or updating a puzzle.
export function puzzlePayload(content: PuzzleContent) {
  return {
    puzzleTitle: tidyText(content.title),
    gridSize: content.size,
    gridValues: content.values.map((value, index) => (content.black[index] ? "" : value)),
    blackSquares: content.black,
    acrossClues: cluesToSave(content, "across"),
    downClues: cluesToSave(content, "down"),
  };
}

// A single letter or digit, upper-cased, or null for anything else.
export function toGridLetter(key: string): string | null {
  return /^[\p{L}\p{N}]$/u.test(key) ? key.toLocaleUpperCase() : null;
}
