import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Authentication from "../components/NonAuthContent/Authentication";
import { useAuth } from "../context/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockHandleCloseModal = vi.fn();

describe("Authentication Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      signup: vi.fn(),
      login: vi.fn(),
      setGlobalUser: vi.fn(),
      isLoading: false,
    });
  });

  test("renders login form by default", () => {
    render(
      <Router>
        <Authentication handleCloseModal={mockHandleCloseModal} />
      </Router>
    );

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/sign into your account/i)).toBeInTheDocument();
  });

  test("toggles to signup form", () => {
    render(
      <Router>
        <Authentication handleCloseModal={mockHandleCloseModal} />
      </Router>
    );

    const toggleButton = screen.getByText(/sign up/i);
    fireEvent.click(toggleButton);

    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  });

  test("submits login form", async () => {
    const mockLogin = vi.fn();
    useAuth.mockReturnValue({
      signup: vi.fn(),
      login: mockLogin,
      setGlobalUser: vi.fn(),
      isLoading: false,
    });

    render(
      <Router>
        <Authentication handleCloseModal={mockHandleCloseModal} />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
  });

  test("displays error message on failed login", async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error("Login failed"));
    useAuth.mockReturnValue({
      signup: vi.fn(),
      login: mockLogin,
      setGlobalUser: vi.fn(),
      isLoading: false,
    });

    render(
      <Router>
        <Authentication handleCloseModal={mockHandleCloseModal} />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("heading", { name: /login/i }));
  });

  test("toggles password visibility", () => {
    render(
      <Router>
        <Authentication handleCloseModal={mockHandleCloseModal} />
      </Router>
    );

    const passwordInput = screen.getByPlaceholderText("********");
    const toggleButton = screen.getByTestId("eye");

    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  test("submits signup form", async () => {
    const mockSignup = vi.fn();
    useAuth.mockReturnValue({
      signup: mockSignup,
      login: vi.fn(),
      setGlobalUser: vi.fn(),
      isLoading: false,
    });

    render(
      <Router>
        <Authentication handleCloseModal={mockHandleCloseModal} />
      </Router>
    );

    fireEvent.click(screen.getByText(/sign up/i));
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText(/submit/i));

    expect(mockSignup).toHaveBeenCalledWith(
      "newuser@example.com",
      "newuser",
      "password123"
    );
  });
});
