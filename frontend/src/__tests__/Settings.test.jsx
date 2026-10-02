import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Settings from "../components/AuthContent/Settings";
import { authValue, callsTo, jsonResponse, mockApi, renderPage } from "./testUtils";

const passwordAccount = {
  user_id: 1,
  username: "alice",
  email: "alice@example.com",
  has_password: true,
  google_linked: false,
};
const googleAccount = { ...passwordAccount, has_password: false, google_linked: true };

function renderSettings(account = passwordAccount, routes = {}) {
  const auth = authValue();
  const fetchMock = mockApi({ "GET /users/me/account": account, ...routes });
  renderPage(<Settings />, { route: "/settings", path: "/settings", auth });
  return { auth, fetchMock };
}

describe("Settings", () => {
  test("shows the current username and email", async () => {
    renderSettings();
    expect(await screen.findByText("alice", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  test("changes the username and updates the rest of the app", async () => {
    const user = userEvent.setup();
    const { auth, fetchMock } = renderSettings(passwordAccount, {
      "PATCH /users/me/account/username": { user: { user_id: 1, username: "ally" } },
    });
    const input = await screen.findByRole("textbox", { name: "New username" });
    await user.clear(input);
    await user.type(input, "ally");
    await user.click(screen.getByRole("button", { name: "Save username" }));

    expect(await screen.findByText("Your username is now ally.")).toBeInTheDocument();
    expect(callsTo(fetchMock, "PATCH", "/users/me/account/username")).toEqual([{ username: "ally" }]);
    expect(auth.updateUser).toHaveBeenCalledWith({ user_id: 1, username: "ally" });
    expect(screen.getByText("ally", { selector: "strong" })).toBeInTheDocument();
  });

  test("shows why a username can't be used", async () => {
    const user = userEvent.setup();
    renderSettings(passwordAccount, {
      "PATCH /users/me/account/username": jsonResponse({ message: "That username is taken." }, 409),
    });
    const input = await screen.findByRole("textbox", { name: "New username" });
    await user.click(screen.getByRole("button", { name: "Save username" }));
    expect(screen.getByText("That's already your username.")).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "bob");
    await user.click(screen.getByRole("button", { name: "Save username" }));
    expect(await screen.findByText("That username is taken.")).toBeInTheDocument();
  });

  test("changing the email asks for the current password", async () => {
    const user = userEvent.setup();
    const { fetchMock } = renderSettings(passwordAccount, {
      "PATCH /users/me/account/email": { email: "new@example.com" },
    });
    await user.type(await screen.findByRole("textbox", { name: "New email" }), "new@example.com");
    await user.type(screen.getByLabelText("Current password", { selector: "#settings-email-password" }), "secret123");
    await user.click(screen.getByRole("button", { name: "Save email" }));

    expect(await screen.findByText("Your email is now new@example.com.")).toBeInTheDocument();
    expect(callsTo(fetchMock, "PATCH", "/users/me/account/email")).toEqual([
      { email: "new@example.com", currentPassword: "secret123" },
    ]);
    expect(screen.getByText("new@example.com", { selector: "strong" })).toBeInTheDocument();
  });

  test("changes the password once the new ones match", async () => {
    const user = userEvent.setup();
    const { fetchMock } = renderSettings(passwordAccount, {
      "PUT /users/me/account/password": { message: "Password changed." },
    });
    await user.type(await screen.findByLabelText("Current password", { selector: "#settings-current-password" }), "old-pass");
    await user.type(screen.getByLabelText("New password (6 or more characters)"), "new-pass-1");
    await user.type(screen.getByLabelText("Confirm new password"), "new-pass-2");
    await user.click(screen.getByRole("button", { name: "Change password" }));
    expect(screen.getByText("The new passwords don't match.")).toBeInTheDocument();
    expect(callsTo(fetchMock, "PUT", "/users/me/account/password")).toHaveLength(0);

    await user.clear(screen.getByLabelText("Confirm new password"));
    await user.type(screen.getByLabelText("Confirm new password"), "new-pass-1");
    await user.click(screen.getByRole("button", { name: "Change password" }));
    expect(await screen.findByText("Password changed.")).toBeInTheDocument();
    expect(callsTo(fetchMock, "PUT", "/users/me/account/password")).toEqual([
      { currentPassword: "old-pass", newPassword: "new-pass-1" },
    ]);
  });

  test("Google accounts change their email without a password and have no password section", async () => {
    const user = userEvent.setup();
    const { fetchMock } = renderSettings(googleAccount, {
      "PATCH /users/me/account/email": { email: "new@example.com" },
    });
    expect(await screen.findByText(/You sign in with Google/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change password" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "New email" }), "new@example.com");
    await user.click(screen.getByRole("button", { name: "Save email" }));
    await screen.findByText("Your email is now new@example.com.");
    expect(callsTo(fetchMock, "PATCH", "/users/me/account/email")).toEqual([{ email: "new@example.com" }]);
  });
});
