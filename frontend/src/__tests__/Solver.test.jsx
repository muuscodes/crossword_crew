import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Solver from "../components/SolveCrossword/Solver";
import { callsTo, jsonResponse, mockApi, puzzleRecord, renderPage } from "./testUtils";

const renderSolver = () => renderPage(<Solver />, { route: "/solver/7", path: "/solver/:gridId" });
const solverPuzzle = puzzleRecord({ completed_status: false, creator_username: "bob" });
const square = (row, column) => screen.getByRole("textbox", { name: new RegExp(`^Row ${row}, column ${column}\\b`) });
const firstSquare = () => square(1, 1);
const isMarkedWrong = (cell) => /shadow-\[inset/.test(cell.parentElement.className);
const ANSWERS = "CATSXABCDEFGHIJKLMNOPQRST";

describe("Solver", () => {
  test("shows the puzzle and the clue for the selected square", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /users/me/solver/7": solverPuzzle });
    renderSolver();
    expect(await screen.findByRole("heading", { name: "Cat Puzzle" })).toBeInTheDocument();
    expect(screen.getByText("By bob")).toBeInTheDocument();

    await user.click(firstSquare());
    expect(screen.getByRole("button", { name: /1A\s*Feline/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /1A\s*Feline/ }));
    expect(screen.getByRole("button", { name: /1D\s*Taxi/ })).toBeInTheDocument();
  });

  test("the server decides whether the puzzle is solved", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me/solver/7": solverPuzzle,
      "PATCH /users/me/solver/7": ({ gridValues }) => ({ completed: gridValues[0] === "C" }),
    });
    renderSolver();
    // Nothing to save until something changes.
    expect(await screen.findByRole("button", { name: "Saved" })).toBeDisabled();
    await user.click(firstSquare());
    await user.keyboard("x");
    await user.click(screen.getByRole("button", { name: "Save progress" }));
    expect(await screen.findByRole("dialog", { name: "Progress saved" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();

    await user.click(firstSquare());
    await user.keyboard("c");
    await user.click(screen.getByRole("button", { name: "Save progress" }));
    expect(await screen.findByRole("dialog", { name: "Puzzle solved" })).toBeInTheDocument();
    expect(callsTo(fetchMock, "PATCH", "/users/me/solver/7")).toHaveLength(2);
  });

  test("autocheck asks the server which letters are wrong and never loads the answers", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me/solver/7": solverPuzzle,
      "POST /users/me/solver/7/check": ({ gridValues }) => ({ incorrect: gridValues[0] === "X" ? [0] : [] }),
    });
    renderSolver();
    await user.click(await screen.findByRole("checkbox", { name: "Autocheck" }));
    await user.click(firstSquare());
    await user.keyboard("x");

    await waitFor(() => expect(firstSquare().parentElement.className).toMatch(/shadow-\[inset/));
    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls.every((url) => url.startsWith("/users/me/solver/7"))).toBe(true);
  });

  test("checking a word marks only its wrong letters, until they change", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me/solver/7": solverPuzzle,
      "POST /users/me/solver/7/check": ({ gridValues }) => ({
        incorrect: gridValues.flatMap((letter, cell) => (letter && letter !== ANSWERS[cell] ? [cell] : [])),
      }),
    });
    renderSolver();
    await user.click(await screen.findByRole("textbox", { name: /^Row 2, column 1\b/ }));
    await user.keyboard("z");
    await user.click(firstSquare());
    await user.keyboard("cx");

    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(screen.getByRole("button", { name: "This word" }));
    expect(await screen.findByText("1 wrong letter, marked in red.")).toBeInTheDocument();
    expect(isMarkedWrong(square(1, 2))).toBe(true);
    expect(isMarkedWrong(square(1, 1))).toBe(false);
    // Row 2 is wrong too, but it isn't part of the word that was checked.
    expect(isMarkedWrong(square(2, 1))).toBe(false);

    await user.click(square(1, 2));
    await user.keyboard("a");
    expect(isMarkedWrong(square(1, 2))).toBe(false);
  });

  test("revealing a square fills in its answer and marks it as revealed", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me/solver/7": solverPuzzle,
      "POST /users/me/solver/7/reveal": ({ cells }) => ({ letters: cells.map((cell) => ({ cell, letter: ANSWERS[cell] })) }),
    });
    renderSolver();
    expect(await screen.findByRole("button", { name: "Saved" })).toBeInTheDocument();
    await user.click(square(1, 2));
    await user.click(screen.getByRole("button", { name: "Reveal" }));
    await user.click(screen.getByRole("button", { name: "This square" }));

    expect(await screen.findByRole("textbox", { name: /^Row 1, column 2\b.*, revealed$/ })).toHaveValue("A");
    expect(callsTo(fetchMock, "POST", "/users/me/solver/7/reveal")).toEqual([{ cells: [1] }]);
    expect(screen.getByRole("button", { name: "Save progress" })).toBeEnabled();
  });

  test("revealing the whole puzzle asks first", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me/solver/7": solverPuzzle,
      "POST /users/me/solver/7/reveal": ({ cells }) => ({ letters: cells.map((cell) => ({ cell, letter: ANSWERS[cell] })) }),
    });
    renderSolver();
    await user.click(await screen.findByRole("button", { name: "Reveal" }));
    // Square and word need a selected square first.
    expect(screen.getByRole("button", { name: "This square" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Whole puzzle" }));

    const dialog = screen.getByRole("dialog", { name: "Reveal the whole puzzle?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(callsTo(fetchMock, "POST", "/users/me/solver/7/reveal")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Reveal" }));
    await user.click(screen.getByRole("button", { name: "Whole puzzle" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reveal" }));
    await waitFor(() => expect(square(5, 5)).toHaveValue("T"));
    expect(callsTo(fetchMock, "POST", "/users/me/solver/7/reveal")[0].cells).toHaveLength(25);
  });

  test("a puzzle that isn't yours sends you home with a note", async () => {
    mockApi({ "GET /users/me/solver/7": jsonResponse({ message: "Puzzle not found." }, 404) });
    renderSolver();
    expect(await screen.findByTestId("location")).toHaveTextContent("/home");
  });
});
