import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Editor from "../components/EditCrossword/Editor";
import { callsTo, jsonResponse, mockApi, puzzleRecord, renderPage } from "./testUtils";

const renderEditor = () => renderPage(<Editor />, { route: "/editor/7", path: "/editor/:gridId" });

function savedPuzzle(overrides = {}) {
  const values = Array(25).fill("");
  values[0] = "C";
  return puzzleRecord({ grid_values: values, is_shared: false, created_at: "2026-01-01T00:00:00Z", ...overrides });
}

describe("Editor", () => {
  test("loads the puzzle and confirms a save only after the server does", async () => {
    const user = userEvent.setup();
    let finishSave;
    const fetchMock = mockApi({
      "GET /users/me/grids/7": savedPuzzle(),
      "PUT /users/me/grids/7": () => new Promise((resolve) => (finishSave = resolve)),
    });
    renderEditor();

    expect(await screen.findByRole("textbox", { name: "Puzzle title:" })).toHaveValue("Cat Puzzle");
    expect(screen.getByRole("textbox", { name: /^Row 1, column 1\b/ })).toHaveValue("C");
    // Nothing to save until something changes, so the same puzzle is never saved twice.
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Puzzle title:" }), "s  ");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByText(/saved!/i)).not.toBeInTheDocument();
    finishSave(jsonResponse({ message: "Puzzle saved." }));
    expect(await screen.findByRole("dialog", { name: "Puzzle saved" })).toBeInTheDocument();
    // Leaving the title box tidied the trailing spaces.
    expect(callsTo(fetchMock, "PUT", "/users/me/grids/7")[0].puzzleTitle).toBe("Cat Puzzles");
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
  });

  test("asks before deleting and goes back to the library afterwards", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me/grids/7": savedPuzzle(),
      "DELETE /users/me/grids/7": new Response(null, { status: 204 }),
    });
    renderEditor();
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(callsTo(fetchMock, "DELETE", "/users/me/grids/7")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getAllByRole("button", { name: "Delete" }).at(-1));
    expect(await screen.findByTestId("location")).toHaveTextContent("/library");
  });

  test("shared puzzles are read-only and say why", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /users/me/grids/7": savedPuzzle({ is_shared: true }) });
    renderEditor();
    expect(await screen.findByText(/has been shared, so it can no longer be edited/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("textbox", { name: /^Row 1, column 2\b/ }));
    await user.keyboard("z");
    expect(screen.getByRole("textbox", { name: /^Row 1, column 2\b/ })).toHaveValue("");
  });

  test("sharing needs saved changes first, then shares", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me/grids/7": savedPuzzle(),
      "PUT /users/me/grids/7": { message: "Puzzle saved." },
      "POST /users/me/grids/7/share": jsonResponse({ message: "Shared with bob.", recipient: "bob" }, 201),
      "GET /users/search": { users: ["bob", "bobby"] },
    });
    renderEditor();
    await user.type(await screen.findByRole("textbox", { name: "Puzzle title:" }), "!");

    await user.click(screen.getByRole("button", { name: "Share" }));
    const recipient = screen.getByRole("combobox", { name: "Share with (username)" });
    expect(recipient).toHaveFocus();
    expect(screen.getByText("Once you share this puzzle, you won't be able to edit or delete it.")).toBeInTheDocument();
    await user.click(await screen.findByRole("option", { name: "bob" }));
    expect(recipient).toHaveValue("bob");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText("Save your changes before sharing.")).toBeInTheDocument();
    expect(callsTo(fetchMock, "POST", "/users/me/grids/7/share")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(await screen.findByRole("button", { name: "OK" }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByRole("dialog", { name: "Puzzle shared" })).toHaveTextContent("Shared with bob!");
    expect(callsTo(fetchMock, "POST", "/users/me/grids/7/share")).toEqual([{ recipientUsername: "bob" }]);
  });

  test("a puzzle that isn't yours sends you home", async () => {
    mockApi({ "GET /users/me/grids/7": jsonResponse({ message: "Puzzle not found." }, 404) });
    renderEditor();
    expect(await screen.findByTestId("location")).toHaveTextContent("/home");
  });

  test("other problems loading the puzzle show the server's message", async () => {
    mockApi({ "GET /users/me/grids/7": jsonResponse({ message: "The database is asleep." }, 500) });
    renderEditor();
    expect(await screen.findByText("The database is asleep.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your library" })).toBeInTheDocument();
  });
});
