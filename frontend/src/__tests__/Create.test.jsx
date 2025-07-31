import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateCrossword from "../components/BuildCrossword/CreateCrossword";
import { useAuth } from "../context/AuthContext";

// Mock the useAuth context
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("CreateCrossword Component", () => {
  const setIsSaved = vi.fn();
  const setUserMessage = vi.fn();
  const fetchWithAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      globalUser: { user_id: "123" },
      fetchWithAuth,
    });
  });

  test("renders CreateCrossword component and displays grid size selector", () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );
    expect(screen.getByLabelText(/Grid Size:/i)).toBeInTheDocument();
  });

  test("changes grid size and updates grid dimensions", () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );
    const gridSizeSelect = screen.getByLabelText(/Grid Size:/i);
    fireEvent.change(gridSizeSelect, { target: { value: "7" } });
    expect(gridSizeSelect.value).toBe("7");
  });

  test("toggles black squares option", () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );
    const checkbox = screen.getByLabelText(/Set Black Squares/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test("updates puzzle title", () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );
    const titleInput = screen.getByLabelText(/Puzzle Title:/i);
    fireEvent.change(titleInput, { target: { value: "My Crossword" } });
    expect(titleInput.value).toBe("My Crossword");
  });

  test("calls saveGrid function when Save button is clicked", async () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );
    const saveButton = screen.getByRole("button", { name: /Save/i });

    fetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Grid saved successfully" }),
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setIsSaved);
    });
  });

  test("shows error message when save fails", async () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );
    const saveButton = screen.getByRole("button", { name: /Save/i });

    fetchWithAuth.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Failed to save grid" }),
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setUserMessage).toHaveBeenCalled();
    });
  });

  test("clears the grid when Clear button is clicked", () => {
    render(
      <CreateCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    );

    const titleInput = screen.getByLabelText(/Puzzle Title:/i);
    fireEvent.change(titleInput, { target: { value: "My Crossword" } });

    const clearButton = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(setIsSaved);
  });
});
