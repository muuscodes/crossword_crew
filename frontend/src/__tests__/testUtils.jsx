import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { vi } from "vitest";
import { AuthContext } from "../context/auth";

export function jsonResponse(body, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Replaces fetch with canned API answers keyed by "METHOD /path", or "METHOD /path?query" for an
// exact query string. A value can be a response body, a Response, or a function that receives the
// parsed request body and the URL's search params.
export function mockApi(routes) {
  const fetchMock = vi.fn(async (url, init = {}) => {
    const method = init.method ?? "GET";
    const [path, query = ""] = url.split("?");
    const handler = routes[`${method} ${url}`] ?? routes[`${method} ${path}`];
    if (handler === undefined) return jsonResponse({ message: `No mock for ${method} ${url}` }, 404);
    const body = init.body ? JSON.parse(init.body) : undefined;
    const result = typeof handler === "function" ? await handler(body, new URLSearchParams(query)) : handler;
    return result instanceof Response ? result : jsonResponse(result);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// The requests made to one endpoint, with parsed bodies.
export function callsTo(fetchMock, method, url) {
  return fetchMock.mock.calls
    .filter(([calledUrl, init = {}]) => calledUrl === url && (init.method ?? "GET") === method)
    .map(([, init = {}]) => (init.body ? JSON.parse(init.body) : undefined));
}

export function authValue(overrides = {}) {
  return {
    status: "authenticated",
    user: { user_id: 1, username: "alice" },
    login: vi.fn(async () => {}),
    signup: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
    updateUser: vi.fn(),
    ...overrides,
  };
}

// Shows where the app navigated to.
function CurrentLocation() {
  const location = useLocation();
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

// Renders a page at `route`, matched by `path`, with a fake logged-in user. Any navigation away
// lands on a probe that shows the new location.
export function renderPage(element, { route = "/", path = "/", auth = authValue() } = {}) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={element} />
          <Route path="*" element={<CurrentLocation />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

// A 5x5 puzzle record the way the API returns it.
export function puzzleRecord(overrides = {}) {
  const cells = 25;
  const across = Array(cells).fill("");
  const down = Array(cells).fill("");
  across[0] = "Feline";
  down[0] = "Taxi";
  return {
    grid_id: 7,
    puzzle_title: "Cat Puzzle",
    grid_size: 5,
    grid_values: Array(cells).fill(""),
    black_squares: Array(cells).fill(false),
    across_clues: across,
    down_clues: down,
    ...overrides,
  };
}
