import AuthProvider from "../context/AuthContext";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../components/AuthContent/Home.tsx";
import { BrowserRouter as Router } from "react-router-dom";

const mockFetchWithAuth = vi.fn();
const mockHandleGoogleRedirect = vi.fn();
const mockSetGlobalUser = vi.fn();
const mockSetIsAuthenticated = vi.fn();
const mockSetLibrarySortSetting = vi.fn();

const mockAuthContextValue = {
  globalUser: { user_id: 1, username: "Guest" },
  isAuthenticated: true,
  setIsAuthenticated: mockSetIsAuthenticated,
  setGlobalUser: mockSetGlobalUser,
  setLibrarySortSetting: mockSetLibrarySortSetting,
  fetchWithAuth: mockFetchWithAuth,
  handleGoogleRedirect: mockHandleGoogleRedirect,
};

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <AuthProvider value={mockAuthContextValue}>
        <Router>
          <Home />
        </Router>
      </AuthProvider>
    );
  });

  test("renders welcome message with username", () => {
    const welcomeMessage = screen.getByText(/Welcome Guest!/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  test("fetches user data on mount", async () => {
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        totalPuzzleCount: 5,
        createdByUserCount: 3,
        createdByOtherCount: 2,
        solvedPuzzleCount: 4,
      }),
    });

    mockHandleGoogleRedirect.mockImplementation(() => {});

    render(
      <AuthProvider value={mockAuthContextValue}>
        <Router>
          <Home />
        </Router>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockFetchWithAuth);
    });
  });

  test("handles sort setting on link click", () => {
    const libraryLink = screen.getByText(/Number of puzzles in library/i);
    fireEvent.click(libraryLink);
    mockSetLibrarySortSetting("dateNewest");
    expect(mockSetLibrarySortSetting).toHaveBeenCalledWith("dateNewest");
  });

  test("disables link if count is zero", async () => {
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        totalPuzzleCount: 0,
        createdByUserCount: 2,
        createdByOtherCount: 5,
        solvedPuzzleCount: 3,
      }),
    });

    await waitFor(() => {
      expect(screen.getAllByText("0")[0]).toBeInTheDocument();
    });

    const libraryLink = screen.getAllByRole("link")[0];
    expect(libraryLink).toHaveClass("hover:cursor-not-allowed");
  });

  test("alerts on error fetching user data", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    mockFetchWithAuth.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValueOnce({ message: "Error fetching data" }),
    });

    render(
      <AuthProvider value={mockAuthContextValue}>
        <Router>
          <Home />
        </Router>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(alertMock);
    });

    alertMock.mockRestore();
  });
});
