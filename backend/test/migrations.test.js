import { readFile, mkdtemp, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { MIGRATIONS_DIR, pendingMigrations, runMigrations } from "../src/migrations.js";
import { createTestDb } from "./helpers.js";

let close;
afterEach(() => close?.());

// A database created by the old init.sql, before the migration runner existed.
async function legacyDatabase() {
  const test = await createTestDb({ migrate: false });
  close = test.close;
  await test.db.exec(await readFile(path.join(MIGRATIONS_DIR, "001_initial_schema.sql"), "utf8"));
  return test.db;
}

test("running migrations twice changes nothing the second time", async () => {
  const { db, close: closeDb } = await createTestDb({ migrate: false });
  close = closeDb;
  expect(await runMigrations(db)).toEqual(["001_initial_schema.sql", "002_integrity_constraints.sql"]);
  expect(await runMigrations(db)).toEqual([]);
  expect(await pendingMigrations(db)).toEqual([]);
});

test("pendingMigrations lists what hasn't run yet", async () => {
  const { db, close: closeDb } = await createTestDb({ migrate: false });
  close = closeDb;
  const dir = await mkdtemp(path.join(tmpdir(), "migrations-"));
  await copyFile(path.join(MIGRATIONS_DIR, "001_initial_schema.sql"), path.join(dir, "001_initial_schema.sql"));
  await runMigrations(db, { dir });
  expect(await pendingMigrations(db)).toEqual(["002_integrity_constraints.sql"]);
});

describe("002_integrity_constraints on existing data", () => {
  test("removes duplicate solver copies and renames clashing Google usernames", async () => {
    const db = await legacyDatabase();
    await db.exec(`
      INSERT INTO users (username, email, password) VALUES ('Sam', 'sam@example.com', 'hash');
      INSERT INTO users (username, email) VALUES ('Sam', 'sam.google@example.com');
      INSERT INTO users (username, email) VALUES ('Kim', 'kim1@example.com');
      INSERT INTO users (username, email) VALUES ('Kim', 'kim2@example.com');
      INSERT INTO crossword_grids (user_id, puzzle_title, grid_size) VALUES (1, 'Shared twice', 5);
      INSERT INTO solver_grids (grid_id, user_id, completed_status) VALUES (1, 3, false);
      INSERT INTO solver_grids (grid_id, user_id, completed_status) VALUES (1, 3, false);
    `);

    await runMigrations(db);

    const users = await db.query("SELECT user_id, username FROM users ORDER BY user_id");
    expect(users.rows.map((row) => row.username)).toEqual(["Sam", "Sam 2", "Kim", "Kim 2"]);
    const copies = await db.query("SELECT count(*)::int AS n FROM solver_grids");
    expect(copies.rows[0].n).toBe(1);

    await expect(
      db.query("INSERT INTO users (username, email) VALUES ('Sam', 'third@example.com')"),
    ).rejects.toThrow(/users_username_key/);
    await expect(
      db.query("INSERT INTO solver_grids (grid_id, user_id) VALUES (1, 3)"),
    ).rejects.toThrow(/solver_grids_pkey/);
  });

  test("stops with instructions when two password accounts share a username", async () => {
    const db = await legacyDatabase();
    await db.exec(`
      INSERT INTO users (username, email, password) VALUES ('Sam', 'a@example.com', 'hash');
      INSERT INTO users (username, email, password) VALUES ('Sam', 'b@example.com', 'hash');
    `);
    await expect(runMigrations(db)).rejects.toThrow(/password accounts share a username/);
    expect(await pendingMigrations(db)).toContain("002_integrity_constraints.sql");
  });

  test("keeps going when old rows point at missing users", async () => {
    const db = await legacyDatabase();
    await db.exec("INSERT INTO crossword_grids (user_id, puzzle_title, grid_size) VALUES (42, 'Orphan', 5)");
    await runMigrations(db);
    await expect(
      db.query("INSERT INTO crossword_grids (user_id, puzzle_title, grid_size) VALUES (43, 'New orphan', 5)"),
    ).rejects.toThrow(/crossword_grids_user_id_fkey/);
  });
});
