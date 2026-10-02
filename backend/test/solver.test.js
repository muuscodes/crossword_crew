import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createPuzzle, createTestContext, samplePuzzle, signUp } from "./helpers.js";

let context;
let creator;
let solverA;
let solverB;
let gridId;
const answers = samplePuzzle().gridValues;

beforeEach(async () => {
  context = await createTestContext();
  creator = await signUp(context.app, "creator");
  solverA = await signUp(context.app, "solver-a");
  solverB = await signUp(context.app, "solver-b");
  gridId = await createPuzzle(creator.client);
  for (const recipientUsername of ["solver-a", "solver-b"]) {
    await creator.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername });
  }
});
afterEach(() => context.close());

test("the solver's copy never includes the answers", async () => {
  const response = await solverA.client.get(`/users/me/solver/${gridId}`).expect(200);
  expect(response.body.grid_values.every((letter) => letter === "")).toBe(true);
  expect(JSON.stringify(response.body)).not.toContain("ABCD");
  expect(response.body).not.toHaveProperty("answer_key");
});

test("saving progress only changes the caller's copy", async () => {
  const progress = answers.map((letter, index) => (index < 3 ? letter : ""));
  await solverA.client.patch(`/users/me/solver/${gridId}`).send({ gridValues: progress }).expect(200);

  const mine = await solverA.client.get(`/users/me/solver/${gridId}`);
  const theirs = await solverB.client.get(`/users/me/solver/${gridId}`);
  expect(mine.body.grid_values.slice(0, 3)).toEqual(["A", "B", "C"]);
  expect(theirs.body.grid_values.every((letter) => letter === "")).toBe(true);
});

test("the server decides when a puzzle is solved", async () => {
  const partial = await solverA.client
    .patch(`/users/me/solver/${gridId}`)
    .send({ gridValues: answers.map((letter, i) => (i === 0 ? "" : letter)) })
    .expect(200);
  expect(partial.body.completed).toBe(false);

  const solved = await solverA.client
    .patch(`/users/me/solver/${gridId}`)
    .send({ gridValues: answers.map((letter) => letter.toLowerCase()) })
    .expect(200);
  expect(solved.body.completed).toBe(true);

  const stats = await solverA.client.get("/users/me/stats");
  expect(stats.body.solved).toBe(1);
  const otherStats = await solverB.client.get("/users/me/stats");
  expect(otherStats.body.solved).toBe(0);
});

test("checking reports wrong letters without revealing answers", async () => {
  const guesses = Array(25).fill("");
  guesses[0] = "A";
  guesses[1] = "Z";
  const response = await solverA.client
    .post(`/users/me/solver/${gridId}/check`)
    .send({ gridValues: guesses })
    .expect(200);
  expect(response.body).toEqual({ incorrect: [1] });
});

test("revealing sends answers only for the squares asked for", async () => {
  const response = await solverA.client
    .post(`/users/me/solver/${gridId}/reveal`)
    .send({ cells: [1, 1, 4, 6] })
    .expect(200);
  // Square 4 is black, so it has no answer to give.
  expect(response.body).toEqual({
    letters: [
      { cell: 1, letter: "B" },
      { cell: 6, letter: "G" },
    ],
  });
});

test("revealing rejects squares outside the grid", async () => {
  const reveal = (cells) => solverA.client.post(`/users/me/solver/${gridId}/reveal`).send({ cells });
  await reveal([25]).expect(400);
  await reveal([-1]).expect(400);
  await reveal([]).expect(400);
  await reveal("all").expect(400);
});

describe("access", () => {
  test("only recipients can open, save or check a copy", async () => {
    const outsider = await signUp(context.app, "outsider");
    const blank = { gridValues: Array(25).fill("") };
    await outsider.client.get(`/users/me/solver/${gridId}`).expect(404);
    await outsider.client.patch(`/users/me/solver/${gridId}`).send(blank).expect(404);
    await outsider.client.post(`/users/me/solver/${gridId}/check`).send(blank).expect(404);
    await outsider.client.post(`/users/me/solver/${gridId}/reveal`).send({ cells: [0] }).expect(404);
  });

  test("rejects letters that don't fit the grid", async () => {
    await solverA.client
      .patch(`/users/me/solver/${gridId}`)
      .send({ gridValues: ["A"] })
      .expect(400);
  });
});
