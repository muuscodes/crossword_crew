import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import Library from "../components/AuthContent/Library";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Library Component", () => {
  const setGlobalUser = vi.fn();
  const setIsAuthenticated = vi.fn();
  const fetchWithAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/auth/session")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            username: "testUser",
            user_id: "123",
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          crossword_grids: [],
          solver_grids: [],
        }),
      });
    });

    useAuth.mockReturnValue({
      globalUser: { user_id: "123", username: "testUser" },
      isAuthenticated: true,
      setIsAuthenticated,
      setGlobalUser,
      librarySortSetting: "author",
      setLibrarySortSetting: vi.fn(),
      fetchWithAuth,
    });
  });

  const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

  test("renders Library component and displays title", () => {
    renderWithRouter(<Library />);
    expect(screen.getByText(/Library/i)).toBeInTheDocument();
  });

  test("displays user cards after fetching data", async () => {
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        crossword_grids: [
          {
            username: "testUser",
            puzzle_title: "Test Puzzle",
            created_at: "2023-01-01T00:00:00Z",
            grid_id: 1,
          },
        ],
        solver_grids: [],
      }),
    });

    renderWithRouter(<Library />);

    await waitFor(() => {
      expect(screen.getAllByText(/Puzzle/i)).toHaveLength(4);
    });
  });

  test("sorts user cards by author when selected", async () => {
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        crossword_grids: [
          {
            username: "Alice",
            puzzle_title: "Puzzle A",
            created_at: "2023-01-01T00:00:00Z",
            grid_id: 1,
          },
          {
            username: "Bob",
            puzzle_title: "Puzzle B",
            created_at: "2023-01-02T00:00:00Z",
            grid_id: 2,
          },
        ],
        solver_grids: [],
      }),
    });

    renderWithRouter(<Library />);

    const sortSelect = screen.getByRole("combobox");
    fireEvent.change(sortSelect, { target: { value: "author" } });

    await waitFor(() => {
      const cards = screen.getAllByText(/Puzzle/i);
      expect(cards[0]).toHaveTextContent("Puzzles created");
    });
  });

  test("handles error when fetching user data fails", async () => {
    fetchWithAuth.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error fetching data" }),
    });

    renderWithRouter(<Library />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Error fetching data/i)
      ).not.toBeInTheDocument();
    });
  });
});
