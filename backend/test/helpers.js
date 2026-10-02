import { once } from "node:events";
import { PGlite } from "@electric-sql/pglite";
import session from "express-session";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createMailer } from "../src/mailer.js";
import { runMigrations } from "../src/migrations.js";

// PGlite is real Postgres compiled to WebAssembly, so tests run the actual SQL and migrations
// in memory without a database server.
export function createPgliteDb(pglite) {
  const wrap = (target) => ({
    query: (text, params) => target.query(text, params),
    exec: (sql) => target.exec(sql),
  });
  return {
    ...wrap(pglite),
    transaction: (work) => pglite.transaction((tx) => work(wrap(tx))),
  };
}

// Booting Postgres and migrating takes a moment, so do it once per test file and give every test
// its own copy of the migrated data directory.
let migratedSnapshot;
async function snapshotOfMigratedDb() {
  if (!migratedSnapshot) {
    const pglite = new PGlite();
    await runMigrations(createPgliteDb(pglite));
    migratedSnapshot = await pglite.dumpDataDir("none");
    await pglite.close();
  }
  return migratedSnapshot;
}

export async function createTestDb({ migrate = true } = {}) {
  const pglite = migrate ? new PGlite({ loadDataDir: await snapshotOfMigratedDb() }) : new PGlite();
  await pglite.waitReady;
  return { db: createPgliteDb(pglite), close: () => pglite.close() };
}

export async function createTestContext({
  welcomeGridId = null,
  rateLimiting = false,
  staticDir,
  feedbackTo = "owner@example.com",
} = {}) {
  const { db, close } = await createTestDb();
  const sentEmails = [];
  const transport = {
    sendMail: async (message) => {
      sentEmails.push(message);
    },
  };
  const config = {
    isProduction: false,
    sessionSecret: "test-secret",
    trustProxy: false,
    google: null,
    email: { user: "team@example.com", pass: "unused" },
    welcomeGridId,
  };
  const app = createApp({
    db,
    mailer: createMailer(config.email, { transport, feedbackTo }),
    config,
    sessionStore: new session.MemoryStore(),
    staticDir,
    rateLimiting,
  });
  // One server per test. Handing supertest the bare app makes it start and stop a server for
  // every request, which occasionally fails with a stray 400 when the machine is very busy.
  const server = app.listen(0);
  await once(server, "listening");
  const shutDown = async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await close();
  };
  return { app: server, db, sentEmails, close: shutDown };
}

// Every write needs the header the frontend sends.
export function api(agent) {
  const withHeader = (method) => (url) => agent[method](url).set("X-Requested-With", "test");
  return {
    get: (url) => agent.get(url),
    post: withHeader("post"),
    put: withHeader("put"),
    patch: withHeader("patch"),
    delete: withHeader("delete"),
  };
}

export async function signUp(app, username, { email = `${username}@example.com`, password = "secret123" } = {}) {
  const agent = request.agent(app);
  const response = await api(agent).post("/auth/signup").send({ username, email, password });
  if (response.status !== 201) {
    throw new Error(`Sign-up failed: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return { agent, client: api(agent), user: response.body.user };
}

// A 5x5 puzzle with black squares in two corners:
//   C A T S #
//   A . . . .
//   ...
export function samplePuzzle(overrides = {}) {
  const size = 5;
  const cells = size * size;
  const blackSquares = Array(cells).fill(false);
  blackSquares[4] = true;
  blackSquares[20] = true;
  const gridValues = Array.from({ length: cells }, (_, i) =>
    blackSquares[i] ? "" : "ABCDEFGHIJKLMNOPQRSTUVWXY"[i],
  );
  const acrossClues = Array(cells).fill("");
  const downClues = Array(cells).fill("");
  acrossClues[0] = "First across";
  downClues[0] = "First down";
  return {
    puzzleTitle: "Sample",
    gridSize: size,
    gridValues,
    blackSquares,
    acrossClues,
    downClues,
    ...overrides,
  };
}

export async function createPuzzle(client, overrides) {
  const response = await client.post("/users/me/grids").send(samplePuzzle(overrides));
  if (response.status !== 201) {
    throw new Error(`Create failed: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return response.body.grid_id;
}
