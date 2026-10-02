import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";
import ClueList from "../components/Crossword/ClueList";
import CrosswordGrid from "../components/Crossword/CrosswordGrid";
import { useCrossword } from "../lib/useCrossword";

function Harness({ readOnly = false }) {
  const crossword = useCrossword(5);
  const [blackSquareMode, setBlackSquareMode] = useState(false);
  return (
    <>
      <label>
        Black squares
        <input type="checkbox" checked={blackSquareMode} onChange={(e) => setBlackSquareMode(e.target.checked)} />
      </label>
      <CrosswordGrid crossword={crossword} label="Grid" readOnly={readOnly} blackSquareMode={blackSquareMode} />
      <ClueList crossword={crossword} editable={!readOnly} />
    </>
  );
}

const square = (row, column) => screen.getByRole("textbox", { name: new RegExp(`^Row ${row}, column ${column}\\b`) });

describe("CrosswordGrid", () => {
  test("typing fills squares and moves across", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(square(1, 1));
    await user.keyboard("cat");
    expect([square(1, 1), square(1, 2), square(1, 3)].map((input) => input.value)).toEqual(["C", "A", "T"]);
    expect(square(1, 4)).toHaveFocus();
  });

  test("clicking the selected square again switches to down", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(square(1, 1));
    await user.click(square(1, 1));
    await user.keyboard("do");
    expect(square(1, 1)).toHaveValue("D");
    expect(square(2, 1)).toHaveValue("O");
  });

  test("Tab jumps to the next clue and arrows move around the grid", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(square(1, 3));
    await user.keyboard("{Tab}");
    expect(square(2, 1)).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowRight}");
    expect(square(3, 2)).toHaveFocus();
  });

  test("read-only grids can be explored but not changed", async () => {
    const user = userEvent.setup();
    render(<Harness readOnly />);
    await user.click(square(1, 1));
    await user.keyboard("x");
    expect(square(1, 1)).toHaveValue("");
  });
});

describe("ClueList", () => {
  test("clue text stays with its clue when black squares change", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole("textbox", { name: "6 across clue" }), "Row two");

    await user.click(screen.getByRole("checkbox", { name: "Black squares" }));
    await user.click(screen.getByRole("button", { name: /^Row 1, column 3, number 3/ }));

    // The square that starts row two is now number 5, and it still has its clue.
    expect(screen.getByRole("textbox", { name: "5 across clue" })).toHaveValue("Row two");
    expect(screen.getByRole("textbox", { name: "3 across clue" })).toHaveValue("");
  });

  test("Enter doesn't add a line break to a clue", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const clue = screen.getByRole("textbox", { name: "1 across clue" });
    await user.type(clue, "One{Enter}Two");
    expect(clue).toHaveValue("OneTwo");
  });

  test("selecting a clue highlights its squares", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("textbox", { name: "2 down clue" }));
    expect(square(1, 2).parentElement).toHaveClass("bg-yellow-200");
    expect(square(2, 2).parentElement).toHaveClass("bg-blue-200");
  });

  test("switching between the across and down clues of one square moves the highlight", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("textbox", { name: "1 across clue" }));
    expect(square(1, 2).parentElement).toHaveClass("bg-blue-200");
    await user.click(screen.getByRole("textbox", { name: "1 down clue" }));
    expect(square(2, 1).parentElement).toHaveClass("bg-blue-200");
    expect(square(1, 2).parentElement).toHaveClass("bg-white");
    await user.click(screen.getByRole("textbox", { name: "1 across clue" }));
    expect(square(1, 2).parentElement).toHaveClass("bg-blue-200");
  });

  test("the same works when solving, where clues are buttons", async () => {
    const user = userEvent.setup();
    render(<Harness readOnly />);
    const [firstAcross, , , , , firstDown] = screen.getAllByRole("button", { name: "No clue written" });
    await user.click(firstAcross);
    expect(square(1, 2).parentElement).toHaveClass("bg-blue-200");
    await user.click(firstDown);
    expect(square(2, 1).parentElement).toHaveClass("bg-blue-200");
    expect(square(1, 2).parentElement).toHaveClass("bg-white");
  });

  test("stray spaces are tidied when leaving a clue", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const clue = screen.getByRole("textbox", { name: "1 across clue" });
    await user.type(clue, "  Big   cat ");
    await user.tab();
    expect(clue).toHaveValue("Big cat");
  });
});

describe("black square mode", () => {
  const blackModeSquare = (row, column) =>
    screen.getByRole("button", { name: new RegExp(`^Row ${row}, column ${column}\\b`) });

  test("the arrow keys move a cursor and Space turns squares black", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("checkbox", { name: "Black squares" }));
    await user.tab();
    expect(blackModeSquare(1, 1)).toHaveFocus();

    await user.keyboard("{ArrowRight}{ArrowDown}");
    expect(blackModeSquare(2, 2)).toHaveFocus();
    await user.keyboard(" ");
    expect(blackModeSquare(2, 2)).toHaveAttribute("aria-pressed", "true");

    // Black squares can be reached too, and the cursor stops at the edge of the grid.
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowRight}");
    expect(blackModeSquare(2, 2)).toHaveFocus();
    await user.keyboard(" ");
    expect(blackModeSquare(2, 2)).toHaveAttribute("aria-pressed", "false");
  });

  test("the grid is a single Tab stop", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("checkbox", { name: "Black squares" }));
    const grid = screen.getByRole("group", { name: "Grid" });
    const tabStops = [...grid.querySelectorAll("button")].filter((button) => button.tabIndex === 0);
    expect(tabStops).toHaveLength(1);
  });
});
