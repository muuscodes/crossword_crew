import request from "supertest";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api, createPuzzle, createTestContext, signUp } from "./helpers.js";

let context;
let ann;

beforeEach(async () => {
  context = await createTestContext();
  ann = await signUp(context.app, "ann", { email: "ann@example.com", password: "old-password" });
});
afterEach(() => context.close());

const login = (username, password) =>
  api(request(context.app)).post("/auth/login").send({ username, password });

test("shows the account details without the password hash", async () => {
  const response = await ann.client.get("/users/me/account").expect(200);
  expect(response.body).toEqual({
    user_id: ann.user.user_id,
    username: "ann",
    email: "ann@example.com",
    has_password: true,
    google_linked: false,
  });
});

test("everything needs a login", async () => {
  const anonymous = api(request(context.app));
  await anonymous.get("/users/me/account").expect(401);
  await anonymous.patch("/users/me/account/username").send({ username: "x" }).expect(401);
  await anonymous.patch("/users/me/account/email").send({ email: "x@example.com" }).expect(401);
  await anonymous.put("/users/me/account/password").send({ currentPassword: "a", newPassword: "bbbbbb" }).expect(401);
});

describe("changing the username", () => {
  test("renames the account and follows it everywhere", async () => {
    const bob = await signUp(context.app, "bob");
    const gridId = await createPuzzle(ann.client);
    await ann.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername: "bob" });

    const response = await ann.client.patch("/users/me/account/username").send({ username: "  annie " }).expect(200);
    expect(response.body.user).toEqual({ user_id: ann.user.user_id, username: "annie" });

    expect((await ann.agent.get("/auth/session")).body.user.username).toBe("annie");
    const library = await bob.client.get("/users/me/grids");
    expect(library.body.received[0].creator_username).toBe("annie");
    await login("annie", "old-password").expect(200);
    await login("ann", "old-password").expect(401);
  });

  test("refuses a name someone else has", async () => {
    await signUp(context.app, "bob");
    const response = await ann.client.patch("/users/me/account/username").send({ username: "bob" }).expect(409);
    expect(response.body.message).toBe("That username is taken.");
  });

  test("keeping the same name is fine", async () => {
    await ann.client.patch("/users/me/account/username").send({ username: "ann" }).expect(200);
  });

  test("validates the length", async () => {
    await ann.client.patch("/users/me/account/username").send({ username: "" }).expect(400);
    await ann.client.patch("/users/me/account/username").send({ username: "x".repeat(51) }).expect(400);
  });
});

describe("changing the email", () => {
  test("needs the current password", async () => {
    await ann.client.patch("/users/me/account/email").send({ email: "new@example.com" }).expect(400);
    await ann.client
      .patch("/users/me/account/email")
      .send({ email: "new@example.com", currentPassword: "wrong" })
      .expect(400);
    const response = await ann.client
      .patch("/users/me/account/email")
      .send({ email: "New@Example.com", currentPassword: "old-password" })
      .expect(200);
    expect(response.body).toEqual({ email: "new@example.com" });
  });

  test("refuses an address another account uses, in any case", async () => {
    await signUp(context.app, "bob", { email: "bob@example.com" });
    const response = await ann.client
      .patch("/users/me/account/email")
      .send({ email: "BOB@example.com", currentPassword: "old-password" })
      .expect(409);
    expect(response.body.message).toContain("already registered");
  });

  test("rejects invalid addresses", async () => {
    await ann.client
      .patch("/users/me/account/email")
      .send({ email: "not-an-email", currentPassword: "old-password" })
      .expect(400);
  });
});

describe("changing the password", () => {
  test("needs the current password, then the new one works", async () => {
    await ann.client
      .put("/users/me/account/password")
      .send({ currentPassword: "wrong", newPassword: "new-password" })
      .expect(400);
    await ann.client
      .put("/users/me/account/password")
      .send({ currentPassword: "old-password", newPassword: "new-password" })
      .expect(200);
    await login("ann", "new-password").expect(200);
    await login("ann", "old-password").expect(401);
  });

  test("validates the new password", async () => {
    const response = await ann.client
      .put("/users/me/account/password")
      .send({ currentPassword: "old-password", newPassword: "123" })
      .expect(400);
    expect(response.body.message).toContain("New password must be 6 to 72 characters.");
  });
});

describe("Google-only accounts", () => {
  // Turn a password account into a Google-only one, keeping its logged-in session.
  async function makeGoogleOnly() {
    await context.db.query("UPDATE users SET password = NULL, google_id = 'g-ann' WHERE username = 'ann'");
  }

  test("can change their email without a password", async () => {
    await makeGoogleOnly();
    const account = await ann.client.get("/users/me/account");
    expect(account.body).toMatchObject({ has_password: false, google_linked: true });
    await ann.client.patch("/users/me/account/email").send({ email: "ann.new@example.com" }).expect(200);
  });

  test("have no password to change", async () => {
    await makeGoogleOnly();
    const response = await ann.client
      .put("/users/me/account/password")
      .send({ currentPassword: "anything", newPassword: "new-password" })
      .expect(400);
    expect(response.body.message).toContain("signs in with Google");
  });
});
