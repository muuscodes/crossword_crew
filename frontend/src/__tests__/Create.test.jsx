import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Create from "../components/AuthContent/Create";
import { callsTo, jsonResponse, mockApi, renderPage } from "./testUtils";

const renderCreate = () => renderPage(<Create />, { route: "/create", path: "/create" });

async function fillPuzzle(user) {
  await user.type(screen.getByRole("textbox", { name: "Puzzle title:" }), "My Puzzle");
  await user.click(screen.getByRole("textbox", { name: /^Row 1, column 1\b/ }));
  await user.keyboard("cat");
  await user.type(screen.getByRole("textbox", { name: "1 across clue" }), "Feline");
  await user.type(screen.getByRole("textbox", { name: "1 down clue" }), "Taxi");
}

describe("Create", () => {
  test("explains what's missing instead of saving an incomplete puzzle", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderCreate();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please add a title, entries to the grid, across clues, and down clues.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("saves the puzzle and opens it in the editor", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /users/me/grids": jsonResponse({ grid_id: 42 }, 201) });
    renderCreate();
    await fillPuzzle(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByTestId("location")).toHaveTextContent("/editor/42");
    const [body] = callsTo(fetchMock, "POST", "/users/me/grids");
    expect(body).toMatchObject({ puzzleTitle: "My Puzzle", gridSize: 5 });
    expect(body.gridValues.slice(0, 3)).toEqual(["C", "A", "T"]);
    expect(body.acrossClues[0]).toBe("Feline");
    expect(body.downClues[0]).toBe("Taxi");
  });

  test("stays put with an error, and no 'saved' message, when the save fails", async () => {
    const user = userEvent.setup();
    mockApi({ "POST /users/me/grids": jsonResponse({ message: "Server is down" }, 500) });
    renderCreate();
    await fillPuzzle(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Server is down")).toBeInTheDocument();
    expect(screen.queryByText(/saved/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  test("asks before a new grid size throws away work", async () => {
    const user = userEvent.setup();
    mockApi({});
    renderCreate();
    await user.click(screen.getByRole("textbox", { name: /^Row 1, column 1\b/ }));
    await user.keyboard("a");

    await user.selectOptions(screen.getByRole("combobox", { name: "Grid size:" }), "7");
    expect(screen.getByRole("dialog", { name: "Start a new grid?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getAllByRole("textbox", { name: /^Row \d, column \d/ })).toHaveLength(25);

    await user.selectOptions(screen.getByRole("combobox", { name: "Grid size:" }), "7");
    await user.click(screen.getByRole("button", { name: "Change size" }));
    expect(screen.getAllByRole("textbox", { name: /^Row \d, column \d/ })).toHaveLength(49);
  });

  test("the help dialog opens and closes", async () => {
    const user = userEvent.setup();
    mockApi({});
    renderCreate();
    await user.click(screen.getByRole("button", { name: "How to create a crossword" }));
    expect(screen.getByRole("dialog", { name: "How to create a crossword" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
