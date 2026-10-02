import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { findOrCreateGoogleUser } from "../src/services/googleUsers.js";
import { createTestDb } from "./helpers.js";

let db;
let close;
const options = { welcomeGridId: null };

const profile = (id, email, displayName = "Gina Google") => ({
  id,
  displayName,
  emails: [{ value: email, verified: true }],
});

beforeEach(async () => {
  ({ db, close } = await createTestDb());
});
afterEach(() => close());

describe("findOrCreateGoogleUser", () => {
  test("creates an account on first sign-in and stores the Google id", async () => {
    const result = await findOrCreateGoogleUser(db, profile("g-1", "Gina@Example.com"), options);
    expect(result.created).toBe(true);
    const { rows } = await db.query("SELECT google_id, email FROM users WHERE user_id = $1", [
      result.user.user_id,
    ]);
    expect(rows[0]).toEqual({ google_id: "g-1", email: "gina@example.com" });

    const again = await findOrCreateGoogleUser(db, profile("g-1", "gina@example.com"), options);
    expect(again).toMatchObject({ created: false, user: result.user });
  });

  test("picks a free username when the display name is taken", async () => {
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ('Gina Google', 'other@example.com', 'hash')",
    );
    const result = await findOrCreateGoogleUser(db, profile("g-1", "gina@example.com"), options);
    expect(result.user.username).toBe("Gina Google 2");
  });

  test("links legacy Google accounts that were saved without a Google id", async () => {
    await db.query("INSERT INTO users (username, email) VALUES ('Gina', 'gina@example.com')");
    const result = await findOrCreateGoogleUser(db, profile("g-1", "gina@example.com"), options);
    expect(result).toMatchObject({ created: false, user: { username: "Gina" } });
    const { rows } = await db.query("SELECT google_id FROM users WHERE username = 'Gina'");
    expect(rows[0].google_id).toBe("g-1");
  });

  test("won't take over a password account that registered the same email", async () => {
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ('squatter', 'gina@example.com', 'hash')",
    );
    await expect(
      findOrCreateGoogleUser(db, profile("g-1", "gina@example.com"), options),
    ).rejects.toMatchObject({ reason: "email_in_use" });
  });
});
