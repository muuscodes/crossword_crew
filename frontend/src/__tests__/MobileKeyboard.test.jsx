import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ClueList from "../components/Crossword/ClueList";
import CrosswordGrid from "../components/Crossword/CrosswordGrid";
import { useCrossword } from "../lib/useCrossword";

// Pretend to be a phone: the main pointer is a finger.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: query === "(pointer: coarse)",
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});

function Harness({ readOnly = false }) {
  const crossword = useCrossword(5);
  return (
    <>
      <CrosswordGrid crossword={crossword} label="Grid" readOnly={readOnly} />
      <ClueList crossword={crossword} editable={false} />
    </>
  );
}

const grid = () => screen.getByRole("group", { name: "Grid" });
const square = (row, column) => within(grid()).getByRole("button", { name: new RegExp(`^Row ${row}, column ${column}\\b`) });
const keyboard = () => screen.queryByRole("group", { name: "Crossword keyboard" });
const key = (label) => within(keyboard()).getByRole("button", { name: label });

describe("on a touch device", () => {
  test("squares are buttons, so the phone's own keyboard never opens", () => {
    render(<Harness />);
    expect(within(grid()).queryAllByRole("textbox")).toHaveLength(0);
    expect(within(grid()).getAllByRole("button")).toHaveLength(25);
  });

  test("tapping a square opens the crossword keyboard and keys fill the grid", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(keyboard()).not.toBeInTheDocument();

    await user.click(square(1, 1));
    expect(keyboard()).toBeInTheDocument();
    await user.click(key("C"));
    await user.click(key("A"));
    await user.click(key("T"));
    expect([square(1, 1), square(1, 2), square(1, 3)].map((cell) => cell.textContent)).toEqual(["C", "A", "T"]);
    expect(square(1, 4)).toHaveFocus();

    await user.click(key("Backspace"));
    expect(square(1, 3)).toHaveTextContent("");
  });

  test("the Across/Down key switches direction", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(square(1, 1));
    await user.click(key(/Typing across/));
    expect(key(/Typing down/)).toHaveTextContent("Down");
    await user.click(key("D"));
    await user.click(key("O"));
    expect(square(1, 1)).toHaveTextContent("D");
    expect(square(2, 1)).toHaveTextContent("O");
  });

  test("the keyboard shows the current clue and steps through clues", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(square(2, 3));
    expect(within(keyboard()).getByRole("button", { name: /^6A/ })).toBeInTheDocument();
    await user.click(key("Next clue"));
    expect(within(keyboard()).getByRole("button", { name: /^7A/ })).toBeInTheDocument();
    expect(square(3, 1)).toHaveFocus();
  });

  test("hiding the keyboard gives the space back to the page", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(square(1, 1));
    expect(document.documentElement.style.getPropertyValue("--keyboard-height")).not.toBe("");

    await user.click(key("Hide keyboard"));
    expect(keyboard()).not.toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue("--keyboard-height")).toBe("");
    expect(document.body.style.paddingBottom).toBe("");
  });

  test("read-only grids never show the keyboard", async () => {
    const user = userEvent.setup();
    render(<Harness readOnly />);
    await user.click(square(1, 1));
    expect(keyboard()).not.toBeInTheDocument();
  });
});
