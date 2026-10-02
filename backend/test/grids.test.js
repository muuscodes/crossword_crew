import request from "supertest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, createPuzzle, createTestContext, samplePuzzle, signUp } from "./helpers.js";

let context;
let alice;
let bob;

beforeEach(async () => {
  context = await createTestContext();
  alice = await signUp(context.app, "alice");
  bob = await signUp(context.app, "bob");
});
afterEach(() => context.close());

describe("creating and editing", () => {
  test("saves a puzzle for the logged-in user and returns its id", async () => {
    const gridId = await createPuzzle(alice.client);
    const puzzle = await alice.client.get(`/users/me/grids/${gridId}`).expect(200);
    expect(puzzle.body).toMatchObject({ grid_id: gridId, puzzle_title: "Sample", is_shared: false });
    expect(puzzle.body.grid_values[0]).toBe("A");
  });

  test("reports what an incomplete puzzle is missing", async () => {
    const response = await alice.client
      .post("/users/me/grids")
      .send(samplePuzzle({ puzzleTitle: "" }))
      .expect(400);
    expect(response.body.message).toBe("Please add a title.");
  });

  test("updates the owner's puzzle", async () => {
    const gridId = await createPuzzle(alice.client);
    await alice.client
      .put(`/users/me/grids/${gridId}`)
      .send(samplePuzzle({ puzzleTitle: "Renamed" }))
      .expect(200);
    const puzzle = await alice.client.get(`/users/me/grids/${gridId}`);
    expect(puzzle.body.puzzle_title).toBe("Renamed");
  });

  test("tidies stray spaces in the title and clues", async () => {
    const acrossClues = samplePuzzle().acrossClues.with(0, "  Big   cat ");
    const gridId = await createPuzzle(alice.client, { puzzleTitle: " My   puzzle ", acrossClues });
    const puzzle = await alice.client.get(`/users/me/grids/${gridId}`);
    expect(puzzle.body.puzzle_title).toBe("My puzzle");
    expect(puzzle.body.across_clues[0]).toBe("Big cat");
  });

  test("deletes the owner's unshared puzzle", async () => {
    const gridId = await createPuzzle(alice.client);
    await alice.client.delete(`/users/me/grids/${gridId}`).expect(204);
    await alice.client.get(`/users/me/grids/${gridId}`).expect(404);
  });
});

describe("other people's puzzles", () => {
  test("can't be read, edited or deleted", async () => {
    const gridId = await createPuzzle(alice.client);
    await bob.client.get(`/users/me/grids/${gridId}`).expect(404);
    await bob.client.put(`/users/me/grids/${gridId}`).send(samplePuzzle({ puzzleTitle: "Hacked" })).expect(404);
    await bob.client.delete(`/users/me/grids/${gridId}`).expect(404);
    await bob.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername: "bob" }).expect(404);

    const untouched = await alice.client.get(`/users/me/grids/${gridId}`).expect(200);
    expect(untouched.body.puzzle_title).toBe("Sample");
  });

  test("aren't reachable through the old user lookup route", async () => {
    await bob.client.get("/users/alice").expect(404);
    await request(context.app).get("/users/alice").expect(401);
  });

  test("everything under /users needs a login", async () => {
    const anonymous = api(request(context.app));
    await anonymous.get("/users/me/grids").expect(401);
    await anonymous.get("/users/me/stats").expect(401);
    await anonymous.post("/users/me/grids").send(samplePuzzle()).expect(401);
  });
});

describe("sharing", () => {
  test("gives the recipient a blank copy and emails them", async () => {
    const gridId = await createPuzzle(alice.client);
    await alice.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername: "bob" }).expect(201);

    const library = await bob.client.get("/users/me/grids").expect(200);
    expect(library.body.received).toEqual([
      expect.objectContaining({ grid_id: gridId, creator_username: "alice", completed_status: false }),
    ]);
    const copy = await bob.client.get(`/users/me/solver/${gridId}`).expect(200);
    expect(copy.body.grid_values.every((letter) => letter === "")).toBe(true);

    await vi.waitFor(() =>
      expect(context.sentEmails.some((email) => email.to === "bob@example.com" && /alice/.test(email.html))).toBe(true),
    );
  });

  test("refuses unknown users, yourself and repeats", async () => {
    const gridId = await createPuzzle(alice.client);
    const share = (recipientUsername) =>
      alice.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername });

    await share("nobody").expect(404);
    await share("alice").expect(400);
    const shared = await share("bob").expect(201);
    expect(shared.body.recipient).toBe("bob");
    await share("bob").expect(409);
  });

  test("freezes the puzzle so it can't be edited or deleted", async () => {
    const gridId = await createPuzzle(alice.client);
    await alice.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername: "bob" });

    const puzzle = await alice.client.get(`/users/me/grids/${gridId}`);
    expect(puzzle.body.is_shared).toBe(true);
    await alice.client.put(`/users/me/grids/${gridId}`).send(samplePuzzle()).expect(409);
    await alice.client.delete(`/users/me/grids/${gridId}`).expect(409);
  });
});

test("stats count created, received and solved puzzles", async () => {
  await createPuzzle(alice.client);
  const shared = await createPuzzle(bob.client);
  await bob.client.post(`/users/me/grids/${shared}/share`).send({ recipientUsername: "alice" });

  const stats = await alice.client.get("/users/me/stats").expect(200);
  expect(stats.body).toEqual({ total: 2, created: 1, received: 1, solved: 0 });
});
