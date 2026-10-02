import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "../App";
import AuthProvider from "../context/AuthContext";
import { jsonResponse, mockApi } from "./testUtils";

const LOGGED_IN = { user: { user_id: 1, username: "alice" } };
const STATS = { total: 0, created: 0, received: 0, solved: 0 };

function renderApp(path) {
  window.history.pushState({}, "", path);
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}

describe("App", () => {
  test("restores the session after a page reload", async () => {
    mockApi({ "GET /auth/session": LOGGED_IN, "GET /users/me/stats": STATS });
    renderApp("/home");
    expect(await screen.findByRole("heading", { name: "Welcome back, alice" })).toBeInTheDocument();
  });

  test("the navigation links to Connections and Settings", async () => {
    mockApi({ "GET /auth/session": LOGGED_IN, "GET /users/me/stats": STATS });
    renderApp("/home");
    const nav = await screen.findByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Connections" })).toHaveAttribute("href", "/connections");
    expect(within(nav).getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  test("logged-out visitors are sent to the landing page", async () => {
    mockApi({ "GET /auth/session": jsonResponse({ message: "Not logged in." }, 401) });
    renderApp("/library");
    expect(await screen.findByRole("heading", { name: "Crossword Crew", level: 1 })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  test("an expired session mid-visit returns to the landing page", async () => {
    mockApi({
      "GET /auth/session": LOGGED_IN,
      "GET /users/me/stats": jsonResponse({ message: "Please log in to continue." }, 401),
    });
    renderApp("/home");
    expect(await screen.findByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  test("navigating doesn't reload the page or log the user out", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /auth/session": LOGGED_IN,
      "GET /users/me/stats": STATS,
      "GET /users/me/grids": { created: [], received: [] },
    });
    renderApp("/home");
    await screen.findByRole("heading", { name: "Welcome back, alice" });
    await user.click(screen.getAllByRole("link", { name: "Library" })[0]);
    expect(await screen.findByRole("heading", { name: "Library" })).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([url]) => url === "/auth/session")).toHaveLength(1);
  });

  test("the navbar's Log in and Sign up buttons open the matching form", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /auth/session": jsonResponse({ message: "Not logged in." }, 401) });
    renderApp("/");
    const navbar = await screen.findByRole("banner");
    await user.click(await within(navbar).findByRole("button", { name: "Sign up" }));
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));

    await user.click(within(navbar).getByRole("button", { name: "Log in" }));
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });

  test("the landing page's buttons open the same forms", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /auth/session": jsonResponse({ message: "Not logged in." }, 401) });
    renderApp("/");
    const hero = await screen.findByRole("region", { name: "Crossword Crew" });
    await user.click(within(hero).getByRole("button", { name: "Get started" }));
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
  });

  test("a failed Google sign-in opens the login dialog with the reason", async () => {
    mockApi({ "GET /auth/session": jsonResponse({ message: "Not logged in." }, 401) });
    renderApp("/?login=email-in-use");
    expect(await screen.findByRole("dialog", { name: "Log in or sign up" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("already belongs to an account with a password");
  });

  test("unknown pages show a not-found message", async () => {
    mockApi({ "GET /auth/session": jsonResponse({ message: "Not logged in." }, 401) });
    renderApp("/no-such-page");
    expect(await screen.findByRole("heading", { name: "Page not found!" })).toBeInTheDocument();
  });
});
