import {
  type Direction,
  type Move,
  clueStarts,
  moveFrom,
  nextClueStart,
  toGridLetter,
} from "./crossword";

export interface Selection {
  cell: number;
  direction: Direction;
}

// The letters, black squares and clues of a puzzle, all indexed by square.
export interface PuzzleGrid {
  size: number;
  black: boolean[];
  values: string[];
  acrossClues: string[];
  downClues: string[];
}

export interface CrosswordState extends PuzzleGrid {
  selection: Selection | null;
  // True when the grid should take keyboard focus for the selected square. False when the
  // selection came from a clue box, which keeps focus while the person types the clue.
  focusGrid: boolean;
  // True when there are changes since the puzzle was created, loaded or last saved.
  dirty: boolean;
}

export type CrosswordAction =
  | { type: "load"; grid: PuzzleGrid }
  | { type: "reset"; size: number }
  | { type: "clear" }
  | { type: "clickCell"; index: number }
  | { type: "focusCell"; index: number }
  | { type: "toggleDirection" }
  | { type: "move"; move: Move }
  | { type: "input"; key: string }
  | { type: "backspace" }
  | { type: "clearCell" }
  | { type: "fillCells"; letters: readonly { cell: number; letter: string }[] }
  | { type: "nextClue"; forward: boolean }
  | { type: "selectClue"; index: number; direction: Direction; focusGrid: boolean }
  | { type: "toggleBlack"; index: number }
  | { type: "setClue"; direction: Direction; index: number; text: string }
  | { type: "clearSelection" }
  | { type: "markSaved" };

export function emptyCrossword(size: number): CrosswordState {
  const cells = size * size;
  return {
    size,
    black: Array(cells).fill(false),
    values: Array(cells).fill(""),
    acrossClues: Array(cells).fill(""),
    downClues: Array(cells).fill(""),
    selection: null,
    focusGrid: false,
    dirty: false,
  };
}

const flip = (direction: Direction): Direction => (direction === "across" ? "down" : "across");

function select(
  state: CrosswordState,
  cell: number,
  direction: Direction,
  focusGrid = true,
): CrosswordState {
  return { ...state, selection: { cell, direction }, focusGrid };
}

function setValue(state: CrosswordState, index: number, value: string): CrosswordState {
  if (state.values[index] === value) return state;
  const values = [...state.values];
  values[index] = value;
  return { ...state, values, dirty: true };
}

export function crosswordReducer(state: CrosswordState, action: CrosswordAction): CrosswordState {
  const { size, black, selection } = state;

  switch (action.type) {
    case "load":
      return { ...emptyCrossword(action.grid.size), ...action.grid };

    // A brand-new grid with nothing to save.
    case "reset":
      return emptyCrossword(action.size);

    // Empties the current grid. Unlike reset, this counts as a change to an existing puzzle.
    case "clear":
      return { ...emptyCrossword(size), dirty: true };

    // Clicking the selected square again switches between across and down. When the selection
    // came from a clue box, the first click just moves into the grid in that clue's direction.
    case "clickCell":
      if (black[action.index]) return state;
      if (selection?.cell === action.index && state.focusGrid) {
        return select(state, action.index, flip(selection.direction));
      }
      return select(state, action.index, selection?.direction ?? "across");

    case "focusCell":
      if (black[action.index] || selection?.cell === action.index) return state;
      return select(state, action.index, selection?.direction ?? "across");

    case "toggleDirection":
      return selection ? select(state, selection.cell, flip(selection.direction)) : state;

    case "move":
      if (!selection) return state;
      return select(state, moveFrom(black, size, selection.cell, action.move), selection.direction);

    // Typing fills the square and moves on in the current direction.
    case "input": {
      const letter = toGridLetter(action.key);
      if (!selection || !letter) return state;
      const next = moveFrom(black, size, selection.cell, selection.direction === "across" ? "right" : "down");
      return select(setValue(state, selection.cell, letter), next, selection.direction);
    }

    // Backspace clears the square, or steps back and clears the previous one when it's empty.
    case "backspace": {
      if (!selection) return state;
      if (state.values[selection.cell]) {
        return { ...setValue(state, selection.cell, ""), focusGrid: true };
      }
      const previous = moveFrom(black, size, selection.cell, selection.direction === "across" ? "left" : "up");
      return select(setValue(state, previous, ""), previous, selection.direction);
    }

    case "clearCell":
      return selection ? setValue(state, selection.cell, "") : state;

    // Letters from somewhere other than typing, like revealed answers. The selection stays put.
    case "fillCells":
      return action.letters.reduce(
        (next, { cell, letter }) => (black[cell] ? next : setValue(next, cell, letter)),
        state,
      );

    case "nextClue": {
      if (!selection) {
        const first = clueStarts(black, size, "across")[0];
        return first === undefined ? state : select(state, first, "across");
      }
      const start = nextClueStart(black, size, selection.cell, selection.direction, action.forward);
      return select(state, start, selection.direction);
    }

    case "selectClue":
      return select(state, action.index, action.direction, action.focusGrid);

    // Clue text stays attached to its square, so it reappears if the square starts an entry again.
    case "toggleBlack": {
      const nextBlack = [...black];
      nextBlack[action.index] = !nextBlack[action.index];
      const values = [...state.values];
      values[action.index] = "";
      return { ...state, black: nextBlack, values, selection: null, dirty: true };
    }

    case "setClue": {
      const key = action.direction === "across" ? "acrossClues" : "downClues";
      const clues = [...state[key]];
      clues[action.index] = action.text;
      return { ...state, [key]: clues, dirty: true };
    }

    case "clearSelection":
      return selection ? { ...state, selection: null } : state;

    case "markSaved":
      return { ...state, dirty: false };
  }
}
