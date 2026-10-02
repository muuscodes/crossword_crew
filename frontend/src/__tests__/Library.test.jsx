import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Library from "../components/AuthContent/Library";
import { jsonResponse, mockApi, renderPage } from "./testUtils";

const library = {
  created: [{ grid_id: 1, puzzle_title: "Zebra", created_at: "2026-03-01T12:00:00Z" }],
  received: [
    {
      grid_id: 2,
      puzzle_title: "Apple",
      created_at: "2026-05-01T12:00:00Z",
      completed_status: true,
      creator_username: "bob",
    },
  ],
};

const renderLibrary = (route = "/library") => renderPage(<Library />, { route, path: "/library" });
const cardTitles = () => screen.getAllByRole("link").map((link) => link.getAttribute("aria-label"));

describe("Library", () => {
  test("own puzzles open in the editor and received ones in the solver", async () => {
    mockApi({ "GET /users/me/grids": library });
    renderLibrary();
    const edit = await screen.findByRole("link", { name: "Edit Zebra" });
    expect(edit).toHaveAttribute("href", "/editor/1");
    expect(within(edit).getByText("Made by you")).toBeInTheDocument();

    const solve = screen.getByRole("link", { name: "Solve Apple" });
    expect(solve).toHaveAttribute("href", "/solver/2");
    expect(within(solve).getByText("Solved")).toBeInTheDocument();
  });

  test("sorting follows the select and the URL", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /users/me/grids": library });
    renderLibrary("/library?sort=created");
    await screen.findByRole("link", { name: "Edit Zebra" });
    expect(cardTitles()).toEqual(["Edit Zebra", "Solve Apple"]);

    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "title");
    expect(cardTitles()).toEqual(["Solve Apple", "Edit Zebra"]);
  });

  test("an empty library points to the Create page", async () => {
    mockApi({ "GET /users/me/grids": { created: [], received: [] } });
    renderLibrary();
    expect(await screen.findByRole("link", { name: "Create a puzzle" })).toHaveAttribute("href", "/create");
  });

  test("errors are shown on the page", async () => {
    mockApi({ "GET /users/me/grids": jsonResponse({ message: "Database unavailable" }, 503) });
    renderLibrary();
    expect(await screen.findByText("Database unavailable")).toBeInTheDocument();
  });
});
