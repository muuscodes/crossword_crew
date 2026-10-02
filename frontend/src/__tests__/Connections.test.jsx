import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Connections from "../components/AuthContent/Connections";
import { callsTo, jsonResponse, mockApi, renderPage } from "./testUtils";

const renderConnections = () => renderPage(<Connections />, { route: "/connections", path: "/connections" });

const library = {
  created: [
    { grid_id: 3, puzzle_title: "Cat Puzzle", created_at: "2026-09-01T12:00:00Z" },
    { grid_id: 4, puzzle_title: "Dog Puzzle", created_at: "2026-09-02T12:00:00Z" },
  ],
  received: [],
};

const connections = [
  { username: "bob", sent: 2, received: 1, last_shared_at: "2026-09-20T12:00:00Z" },
  { username: "carol", sent: 0, received: 1, last_shared_at: "2026-08-05T12:00:00Z" },
];

describe("Connections", () => {
  test("lists the people you've traded puzzles with", async () => {
    mockApi({ "GET /users/me/connections": { connections }, "GET /users/me/grids": library });
    renderConnections();
    expect(await screen.findByText("bob")).toBeInTheDocument();
    expect(screen.getByText("You sent 2 puzzles. They sent you 1 puzzle.")).toBeInTheDocument();
    expect(screen.getByText("Last shared September 20, 2026")).toBeInTheDocument();
    expect(screen.getByText("You sent 0 puzzles. They sent you 1 puzzle.")).toBeInTheDocument();
  });

  test("sends a puzzle to a user picked from the search dropdown", async () => {
    const user = userEvent.setup();
    let shared = false;
    const fetchMock = mockApi({
      "GET /users/me/connections": () => ({ connections: shared ? connections.slice(0, 1) : [] }),
      "GET /users/me/grids": library,
      "GET /users/search": { users: ["bob", "carol"] },
      "POST /users/me/grids/4/share": () => {
        shared = true;
        return jsonResponse({ message: "Shared with bob." }, 201);
      },
    });
    renderConnections();
    expect(await screen.findByText(/No connections yet/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Puzzle" }), "Dog Puzzle");
    await user.click(screen.getByRole("combobox", { name: "Send to" }));
    await user.click(await screen.findByRole("option", { name: "bob" }));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Shared with bob.")).toBeInTheDocument();
    expect(callsTo(fetchMock, "POST", "/users/me/grids/4/share")).toEqual([{ recipientUsername: "bob" }]);
    // The list refreshes to show the new connection.
    expect(await screen.findByText("You sent 2 puzzles. They sent you 1 puzzle.")).toBeInTheDocument();
  });

  test("checks the form before sending", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "GET /users/me/connections": { connections }, "GET /users/me/grids": library });
    renderConnections();
    await user.click(await screen.findByRole("button", { name: "Send" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose one of your puzzles to send.");
    await user.selectOptions(screen.getByRole("combobox", { name: "Puzzle" }), "Cat Puzzle");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose who to send it to.");
    expect(callsTo(fetchMock, "POST", "/users/me/grids/3/share")).toHaveLength(0);
  });

  test("'Send a puzzle' on a connection fills in their name", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /users/me/connections": { connections }, "GET /users/me/grids": library });
    renderConnections();
    await user.click(await screen.findByRole("button", { name: "Send a puzzle to carol" }));
    expect(screen.getByRole("combobox", { name: "Send to" })).toHaveValue("carol");
    expect(screen.getByRole("combobox", { name: "Puzzle" })).toHaveFocus();
  });

  test("without any puzzles it points to the Create page", async () => {
    mockApi({ "GET /users/me/connections": { connections }, "GET /users/me/grids": { created: [], received: [] } });
    renderConnections();
    expect(await screen.findByRole("link", { name: "Create a puzzle" })).toHaveAttribute("href", "/create");
    expect(screen.queryByRole("button", { name: /Send a puzzle to/ })).not.toBeInTheDocument();
  });
});
