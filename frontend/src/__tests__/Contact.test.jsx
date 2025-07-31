import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "../context/AuthContext";
import Contact from "../components/AuthContent/Contact";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Contact Component", () => {
  const mockSetIsAuthenticated = vi.fn();
  const mockSetGlobalUser = vi.fn();
  const mockFetchWithAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();

    global.fetch = vi.fn((url) => {
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
      setIsAuthenticated: mockSetIsAuthenticated,
      setGlobalUser: mockSetGlobalUser,
      fetchWithAuth: mockFetchWithAuth,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders contact form", () => {
    render(<Contact />);
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  test("handles input changes", () => {
    render(<Contact />);

    const usernameInput = screen.getByLabelText(/Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const messageInput = screen.getByLabelText(/Message/i);

    fireEvent.change(usernameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Hello!" } });

    expect(usernameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("john@example.com");
    expect(messageInput.value).toBe("Hello!");
  });

  test("submits form successfully", async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: true });

    render(<Contact />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Hello!" },
    });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        "/email/contact",
        expect.any(Object)
      );
      expect(mockSetGlobalUser).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/Name/i).value).toBe("");
      expect(screen.getByLabelText(/Email/i).value).toBe("");
      expect(screen.getByLabelText(/Message/i).value).toBe("");
    });
  });

  test("handles form submission error", async () => {
    mockFetchWithAuth.mockResolvedValueOnce({ ok: false });

    render(<Contact />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Hello!" },
    });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        "/email/contact",
        expect.any(Object)
      );
    });
  });
});
