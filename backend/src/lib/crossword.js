// Grid rules shared by every puzzle route. Cells are stored row by row, so the cell at
// (row, col) lives at index row * size + col. The frontend uses the same rules in
// frontend/src/lib/crossword.ts.

export const GRID_SIZES = [5, 7, 9, 11, 13, 15];

export function startsAcross(black, size, index) {
  return !black[index] && (index % size === 0 || black[index - 1]);
}

export function startsDown(black, size, index) {
  return !black[index] && (index < size || black[index - size]);
}

// Clue numbers, in reading order, for every cell that starts an across or down entry.
export function assignNumbers(black, size) {
  const numbers = Array(size * size).fill(null);
  let next = 1;
  for (let index = 0; index < size * size; index++) {
    if (startsAcross(black, size, index) || startsDown(black, size, index)) {
      numbers[index] = next++;
    }
  }
  return numbers;
}

// The stored clue_number_directions format: ["across" | "", "down" | ""] for every cell.
export function clueDirections(black, size) {
  return Array.from({ length: size * size }, (_, index) => [
    startsAcross(black, size, index) ? "across" : "",
    startsDown(black, size, index) ? "down" : "",
  ]);
}

export function normalizeLetter(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

// True when every white square matches the answer key.
export function isSolved(values, answerKey, black) {
  return answerKey.every(
    (answer, index) => black[index] || normalizeLetter(values[index]) === normalizeLetter(answer),
  );
}

// Indices of filled-in white squares that don't match the answer key.
export function incorrectCells(values, answerKey, black) {
  const incorrect = [];
  values.forEach((value, index) => {
    const letter = normalizeLetter(value);
    if (!black[index] && letter && letter !== normalizeLetter(answerKey[index])) {
      incorrect.push(index);
    }
  });
  return incorrect;
}

// "a", "a and b", "a, b, and c"
export function joinList(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}
