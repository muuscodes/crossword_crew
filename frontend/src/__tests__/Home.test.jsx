import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Home from "../components/AuthContent/Home";
import { jsonResponse, mockApi, renderPage } from "./testUtils";

const renderHome = () => renderPage(<Home />, { route: "/home", path: "/home" });

describe("Home", () => {
  test("greets the user and shows their stats", async () => {
    mockApi({ "GET /users/me/stats": { total: 3, created: 2, received: 1, solved: 0 } });
    renderHome();
    expect(screen.getByRole("heading", { name: "Welcome back, alice" })).toBeInTheDocument();

    const created = await screen.findByRole("link", { name: /Puzzles you made/ });
    expect(created).toHaveTextContent("2");
    expect(created).toHaveAttribute("href", "/library?sort=created");
    expect(screen.getByRole("link", { name: /Puzzles shared with you/ })).toHaveAttribute(
      "href",
      "/library?sort=received",
    );
  });

  test("counts of zero aren't links", async () => {
    mockApi({ "GET /users/me/stats": { total: 3, created: 2, received: 1, solved: 0 } });
    renderHome();
    await screen.findByRole("link", { name: /Puzzles you made/ });
    expect(screen.queryByRole("link", { name: /Puzzles solved/ })).not.toBeInTheDocument();
    expect(screen.getByText("Puzzles solved")).toBeInTheDocument();
  });

  test("shows an error instead of an alert when stats can't load", async () => {
    mockApi({ "GET /users/me/stats": jsonResponse({ message: "Stats unavailable" }, 500) });
    renderHome();
    expect(await screen.findByRole("alert")).toHaveTextContent("Stats unavailable");
  });

  test("shows the note from a page that sent the user here, until it's dismissed", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /users/me/stats": { total: 0, created: 0, received: 0, solved: 0 } });
    renderPage(<Home />, { route: { pathname: "/home", state: { notice: "That puzzle isn't yours." } }, path: "/home" });
    expect(screen.getByText("That puzzle isn't yours.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("That puzzle isn't yours.")).not.toBeInTheDocument();
  });
});
