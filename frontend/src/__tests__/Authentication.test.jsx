import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Authentication from "../components/NonAuthContent/Authentication";
import { ApiError } from "../lib/api";
import { authValue, renderPage } from "./testUtils";

function renderAuthentication({ auth = authValue({ status: "unauthenticated", user: null }), initialError } = {}) {
  const onClose = vi.fn();
  renderPage(<Authentication onClose={onClose} initialError={initialError} />, { auth });
  return { auth, onClose };
}

describe("Authentication", () => {
  test("logs in, closes and goes home", async () => {
    const user = userEvent.setup();
    const { auth, onClose } = renderAuthentication();
    await user.type(screen.getByLabelText("Username"), " alice ");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(auth.login).toHaveBeenCalledWith("alice", "secret123");
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByTestId("location")).toHaveTextContent("/home");
  });

  test("shows login errors in the form", async () => {
    const user = userEvent.setup();
    const auth = authValue({
      status: "unauthenticated",
      user: null,
      login: vi.fn(async () => {
        throw new ApiError("Incorrect username or password.", 401);
      }),
    });
    const { onClose } = renderAuthentication({ auth });
    await user.type(screen.getByLabelText("Username"), "alice");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Incorrect username or password.")).toHaveAttribute("role", "alert");
    expect(onClose).not.toHaveBeenCalled();
  });

  test("signs up with an email address", async () => {
    const user = userEvent.setup();
    const { auth } = renderAuthentication();
    await user.click(screen.getByRole("button", { name: "Sign up" }));
    await user.type(screen.getByLabelText("Username"), "newbie");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(auth.signup).toHaveBeenCalledWith("new@example.com", "newbie", "secret123");
  });

  test("shows a Google sign-in problem passed in by the page", () => {
    renderAuthentication({ initialError: "Google sign-in didn't work. Please try again." });
    expect(screen.getByRole("alert")).toHaveTextContent("Google sign-in didn't work.");
    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute("href", "/auth/google");
  });

  test("the eye button shows and hides the password", async () => {
    const user = userEvent.setup();
    renderAuthentication();
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
  });
});
