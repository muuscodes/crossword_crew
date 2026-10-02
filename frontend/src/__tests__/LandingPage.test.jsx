import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import LandingPage from "../components/NonAuthContent/LandingPage";

const renderLanding = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );

test("walks through the app in clue-style sections", () => {
  renderLanding();
  expect(screen.getByRole("heading", { level: 1, name: "Crossword Crew" })).toBeInTheDocument();
  for (const name of ["Build a grid", "Write the clues", "Share with your crew", "Solve anywhere", "Your turn"]) {
    expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
  }
});

describe("the grid to try", () => {
  const sampleGrid = () => screen.getByRole("group", { name: /^Sample crossword grid/ });
  const square = (row, column) => within(sampleGrid()).getByRole("button", { name: `Row ${row}, column ${column}` });

  test("black squares come in symmetric pairs and the clue count follows", async () => {
    const user = userEvent.setup();
    renderLanding();
    expect(screen.getByText(/across clues and/)).toHaveTextContent("5 across clues and 5 down clues");

    await user.click(square(1, 2));
    expect(square(1, 2)).toHaveAttribute("aria-pressed", "true");
    expect(square(5, 4)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/across clues and/)).toHaveTextContent("7 across clues and 5 down clues");

    await user.click(screen.getByRole("checkbox", { name: "Keep it symmetric" }));
    await user.click(square(3, 1));
    expect(square(3, 1)).toHaveAttribute("aria-pressed", "true");
    expect(square(3, 5)).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Start over" }));
    expect(square(1, 2)).toHaveAttribute("aria-pressed", "false");
    expect(square(1, 5)).toHaveAttribute("aria-pressed", "true");
  });
});

describe("the clue demo", () => {
  const currentClue = () => screen.getByRole("status", { name: "Current clue" });
  const grid = () => screen.getByRole("group", { name: "Sample filled-in grid" });

  test("picking a clue shows it and lights up its squares", async () => {
    const user = userEvent.setup();
    renderLanding();
    expect(currentClue()).toHaveTextContent("1A Organ that keeps the beat");

    await user.click(screen.getByRole("textbox", { name: "8 across clue" }));
    expect(currentClue()).toHaveTextContent("8A Sticky stuff from a pine");
    expect(within(grid()).getByRole("button", { name: "Row 4, column 1, R" })).toHaveClass("bg-yellow-200");
    expect(within(grid()).getByRole("button", { name: "Row 4, column 5, N" })).toHaveClass("bg-blue-200");
  });

  test("clicking a square twice switches to its down clue, and clues can be rewritten", async () => {
    const user = userEvent.setup();
    renderLanding();
    const square = within(grid()).getByRole("button", { name: "Row 1, column 3, A" });
    await user.click(square);
    await user.click(square);
    expect(currentClue()).toHaveTextContent("3D Mistreat");

    const clue = screen.getByRole("textbox", { name: "3 down clue" });
    await user.clear(clue);
    await user.type(clue, "Treat badly");
    expect(currentClue()).toHaveTextContent("3D Treat badly");
  });
});
