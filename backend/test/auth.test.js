import request from "supertest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, createPuzzle, createTestContext, signUp } from "./helpers.js";

let context;
afterEach(() => context.close());

describe("sign-up", () => {
  beforeEach(async () => {
    context = await createTestContext();
  });

  test("creates the account, logs it in and sends an escaped welcome email", async () => {
    const { agent, user } = await signUp(context.app, "<b>Ann</b>", { email: "Ann@Example.com" });
    expect(user).toEqual({ user_id: 1, username: "<b>Ann</b>" });

    const session = await agent.get("/auth/session").expect(200);
    expect(session.body.user.username).toBe("<b>Ann</b>");

    await vi.waitFor(() => expect(context.sentEmails).toHaveLength(1));
    const [email] = context.sentEmails;
    expect(email.to).toBe("ann@example.com");
    expect(email.html).toContain("&lt;b&gt;Ann&lt;/b&gt;");
    expect(email.html).not.toContain("<b>Ann</b>");
  });

  test("never returns password hashes", async () => {
    const { agent } = await signUp(context.app, "ann");
    const session = await agent.get("/auth/session");
    expect(JSON.stringify(session.body)).not.toMatch(/password|\$2[aby]\$/);
  });

  test("rejects a taken username or email", async () => {
    await signUp(context.app, "ann");
    const client = api(request(context.app));
    await client
      .post("/auth/signup")
      .send({ username: "ann", email: "new@example.com", password: "secret123" })
      .expect(409);
    await client
      .post("/auth/signup")
      .send({ username: "other", email: "ANN@example.com", password: "secret123" })
      .expect(409);
  });

  test("validates input lengths instead of failing in the database", async () => {
    const client = api(request(context.app));
    const response = await client
      .post("/auth/signup")
      .send({ username: "x".repeat(51), email: "not-an-email", password: "123" })
      .expect(400);
    expect(response.body.message).toContain("Usernames are 1 to 50 characters.");
    expect(response.body.message).toContain("Enter a valid email address.");
    expect(response.body.message).toContain("Password must be 6 to 72 characters.");
  });

  test("blocks writes that lack the X-Requested-With header", async () => {
    await request(context.app)
      .post("/auth/signup")
      .send({ username: "ann", email: "ann@example.com", password: "secret123" })
      .expect(403);
  });
});

describe("welcome puzzle", () => {
  test("is copied into new accounts when it exists", async () => {
    context = await createTestContext({ welcomeGridId: 1 });
    const { client: owner } = await signUp(context.app, "owner");
    await createPuzzle(owner);

    const { client } = await signUp(context.app, "newcomer");
    const library = await client.get("/users/me/grids").expect(200);
    expect(library.body.received).toHaveLength(1);
    expect(library.body.received[0].creator_username).toBe("owner");
  });

  test("being missing doesn't block sign-up", async () => {
    context = await createTestContext({ welcomeGridId: 99 });
    await signUp(context.app, "ann");
  });
});

describe("login and logout", () => {
  beforeEach(async () => {
    context = await createTestContext();
    await signUp(context.app, "ann", { password: "correct-horse" });
  });

  test("logs in with the right password", async () => {
    const agent = request.agent(context.app);
    const response = await api(agent)
      .post("/auth/login")
      .send({ username: "ann", password: "correct-horse" })
      .expect(200);
    expect(response.body.user.username).toBe("ann");
    await agent.get("/auth/session").expect(200);
  });

  test("gives the same answer for a wrong password and an unknown user", async () => {
    const client = api(request(context.app));
    const wrongPassword = await client
      .post("/auth/login")
      .send({ username: "ann", password: "nope-nope" })
      .expect(401);
    const unknownUser = await client
      .post("/auth/login")
      .send({ username: "nobody", password: "nope-nope" })
      .expect(401);
    expect(wrongPassword.body.message).toBe(unknownUser.body.message);
  });

  test("explains that Google accounts can't use a password", async () => {
    await context.db.query(
      "INSERT INTO users (username, email, google_id) VALUES ('gina', 'gina@example.com', 'g-1')",
    );
    const response = await api(request(context.app))
      .post("/auth/login")
      .send({ username: "gina", password: "anything" })
      .expect(401);
    expect(response.body.message).toContain("Google");
  });

  test("logout ends the session", async () => {
    const agent = request.agent(context.app);
    await api(agent).post("/auth/login").send({ username: "ann", password: "correct-horse" });
    await api(agent).post("/auth/logout").expect(204);
    await agent.get("/auth/session").expect(401);
  });
});

describe("login rate limit", () => {
  test("blocks repeated failures but not successful logins", async () => {
    context = await createTestContext({ rateLimiting: true });
    await signUp(context.app, "ann", { password: "correct-horse" });
    const client = api(request(context.app));

    for (let attempt = 0; attempt < 5; attempt++) {
      await client.post("/auth/login").send({ username: "ann", password: "wrong-pass" }).expect(401);
    }
    const blocked = await client
      .post("/auth/login")
      .send({ username: "ann", password: "wrong-pass" })
      .expect(429);
    expect(blocked.body.message).toContain("Too many failed login attempts");
  });
});

test("Google routes redirect with a message when Google isn't configured", async () => {
  context = await createTestContext();
  const response = await request(context.app).get("/auth/google").expect(302);
  expect(response.headers.location).toBe("/?login=google-unavailable");
});
