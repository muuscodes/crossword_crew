import { describe, expect, test } from "vitest";
import {
  type CrosswordAction,
  type CrosswordState,
  crosswordReducer,
  emptyCrossword,
} from "../lib/crosswordReducer";

const run = (state: CrosswordState, ...actions: CrosswordAction[]) =>
  actions.reduce(crosswordReducer, state);

describe("selecting squares", () => {
  test("clicking the selected square switches direction, other squares keep it", () => {
    let state = run(emptyCrossword(5), { type: "clickCell", index: 0 });
    expect(state.selection).toEqual({ cell: 0, direction: "across" });
    state = run(state, { type: "clickCell", index: 0 });
    expect(state.selection).toEqual({ cell: 0, direction: "down" });
    state = run(state, { type: "clickCell", index: 7 });
    expect(state.selection).toEqual({ cell: 7, direction: "down" });
  });

  test("after picking a clue, clicking its square moves into the grid without switching direction", () => {
    let state = run(emptyCrossword(5), { type: "selectClue", index: 0, direction: "down", focusGrid: false });
    state = run(state, { type: "clickCell", index: 0 });
    expect(state.selection).toEqual({ cell: 0, direction: "down" });
    expect(state.focusGrid).toBe(true);
    state = run(state, { type: "clickCell", index: 0 });
    expect(state.selection).toEqual({ cell: 0, direction: "across" });
  });

  test("focusing a square never switches direction", () => {
    const state = run(emptyCrossword(5), { type: "clickCell", index: 0 }, { type: "focusCell", index: 0 });
    expect(state.selection?.direction).toBe("across");
  });

  test("black squares can't be selected", () => {
    const state = run(emptyCrossword(5), { type: "toggleBlack", index: 3 }, { type: "clickCell", index: 3 });
    expect(state.selection).toBeNull();
  });
});

describe("typing", () => {
  test("fills the square and moves on in the current direction", () => {
    let state = run(emptyCrossword(5), { type: "clickCell", index: 0 }, { type: "input", key: "c" });
    expect(state.values[0]).toBe("C");
    expect(state.selection?.cell).toBe(1);

    state = run(state, { type: "toggleDirection" }, { type: "input", key: "a" });
    expect(state.values[1]).toBe("A");
    expect(state.selection?.cell).toBe(6);
    expect(state.dirty).toBe(true);
  });

  test("ignores keys that aren't letters or digits", () => {
    const state = run(emptyCrossword(5), { type: "clickCell", index: 0 }, { type: "input", key: "%" });
    expect(state.values[0]).toBe("");
  });

  test("backspace clears the square, then steps back and clears the previous one", () => {
    let state = run(
      emptyCrossword(5),
      { type: "clickCell", index: 0 },
      { type: "input", key: "a" },
      { type: "input", key: "b" },
    );
    state = run(state, { type: "backspace" });
    expect(state.selection?.cell).toBe(1);
    expect(state.values.slice(0, 2)).toEqual(["A", ""]);
    state = run(state, { type: "backspace" });
    expect(state.selection?.cell).toBe(0);
    expect(state.values[0]).toBe("");
  });
});

test("filling squares sets their letters, skips black squares and keeps the selection", () => {
  const start = run(emptyCrossword(5), { type: "toggleBlack", index: 4 }, { type: "clickCell", index: 7 });
  const state = run(start, {
    type: "fillCells",
    letters: [
      { cell: 0, letter: "C" },
      { cell: 4, letter: "X" },
    ],
  });
  expect(state.values.slice(0, 5)).toEqual(["C", "", "", "", ""]);
  expect(state.selection).toEqual(start.selection);
  expect(state.dirty).toBe(true);
});

describe("black squares and clues", () => {
  test("toggling a black square clears its letter and the selection", () => {
    const state = run(
      emptyCrossword(5),
      { type: "clickCell", index: 2 },
      { type: "input", key: "x" },
      { type: "toggleBlack", index: 2 },
    );
    expect(state.black[2]).toBe(true);
    expect(state.values[2]).toBe("");
    expect(state.selection).toBeNull();
  });

  test("clue text stays with its square when black squares change", () => {
    const state = run(
      emptyCrossword(5),
      { type: "setClue", direction: "across", index: 5, text: "Row two" },
      { type: "toggleBlack", index: 2 },
    );
    expect(state.acrossClues[5]).toBe("Row two");
    expect(state.acrossClues[3]).toBe("");
  });

  test("selecting a clue from its text box leaves focus in the box", () => {
    const state = run(emptyCrossword(5), { type: "selectClue", index: 5, direction: "across", focusGrid: false });
    expect(state).toMatchObject({ selection: { cell: 5, direction: "across" }, focusGrid: false });
  });
});

describe("saving state", () => {
  test("load and markSaved leave nothing to save, clear does", () => {
    const loaded = run(emptyCrossword(5), {
      type: "load",
      grid: { ...emptyCrossword(7), values: Array(49).fill("A") },
    });
    expect(loaded).toMatchObject({ size: 7, dirty: false });
    expect(run(loaded, { type: "clear" }).dirty).toBe(true);
    expect(run(loaded, { type: "reset", size: 5 }).dirty).toBe(false);
    expect(run(loaded, { type: "setClue", direction: "down", index: 0, text: "x" }, { type: "markSaved" }).dirty).toBe(false);
  });

  test("next clue with nothing selected starts at the first across clue", () => {
    expect(run(emptyCrossword(5), { type: "nextClue", forward: true }).selection).toEqual({
      cell: 0,
      direction: "across",
    });
  });
});
