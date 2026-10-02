import request from "supertest";
import { afterEach, describe, expect, test } from "vitest";
import { api, createPuzzle, createTestContext, signUp } from "./helpers.js";

let context;
afterEach(() => context.close());

describe("username search", () => {
  test("lists other users, best matches first, and never yourself", async () => {
    context = await createTestContext();
    const { client } = await signUp(context.app, "alice");
    for (const name of ["bob", "Bobby", "annabel", "rob_b"]) await signUp(context.app, name);

    const all = await client.get("/users/search").expect(200);
    expect(all.body.users).toEqual(["annabel", "bob", "Bobby", "rob_b"]);

    const bob = await client.get("/users/search?q=BOB").expect(200);
    expect(bob.body.users).toEqual(["bob", "Bobby"]);

    const contains = await client.get("/users/search?q=ob").expect(200);
    expect(contains.body.users).toEqual(["bob", "Bobby", "rob_b"]);
  });

  test("treats % and _ as plain characters and returns only usernames", async () => {
    context = await createTestContext();
    const { client } = await signUp(context.app, "alice");
    await signUp(context.app, "rob_b");
    await signUp(context.app, "robxb");

    const response = await client.get(`/users/search?q=${encodeURIComponent("_")}`).expect(200);
    expect(response.body).toEqual({ users: ["rob_b"] });
    const percent = await client.get(`/users/search?q=${encodeURIComponent("%")}`).expect(200);
    expect(percent.body.users).toEqual([]);
  });

  test("needs a login", async () => {
    context = await createTestContext();
    await api(request(context.app)).get("/users/search?q=a").expect(401);
  });
});

describe("connections", () => {
  test("counts puzzles sent and received with each person, most recent first", async () => {
    context = await createTestContext();
    const alice = await signUp(context.app, "alice");
    const bob = await signUp(context.app, "bob");
    const carol = await signUp(context.app, "carol");
    await signUp(context.app, "stranger");

    const share = async (from, to) => {
      const gridId = await createPuzzle(from.client);
      await from.client.post(`/users/me/grids/${gridId}/share`).send({ recipientUsername: to }).expect(201);
    };
    await share(alice, "bob");
    await share(alice, "bob");
    await share(bob, "alice");
    await share(carol, "alice");

    const response = await alice.client.get("/users/me/connections").expect(200);
    expect(response.body.connections.map(({ username, sent, received }) => ({ username, sent, received }))).toEqual([
      { username: "carol", sent: 0, received: 1 },
      { username: "bob", sent: 2, received: 1 },
    ]);
    expect(response.body.connections[0].last_shared_at).toBeTruthy();
  });

  test("leaves out the welcome puzzle everyone receives", async () => {
    context = await createTestContext({ welcomeGridId: 1 });
    const founder = await signUp(context.app, "founder");
    await createPuzzle(founder.client);
    const newcomer = await signUp(context.app, "newcomer");

    expect((await newcomer.client.get("/users/me/connections")).body.connections).toEqual([]);
    expect((await founder.client.get("/users/me/connections")).body.connections).toEqual([]);
  });
});
