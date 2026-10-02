import { describe, expect, test } from "vitest";
import { DEFAULT_FEEDBACK_EMAIL, loadConfig, parseTrustProxy, parseWelcomeGridId } from "../src/config.js";

describe("loadConfig", () => {
  test("feedback goes to the team inbox unless FEEDBACK_EMAIL says otherwise", () => {
    expect(loadConfig({ SESSION_SECRET: "s" }).feedbackEmail).toBe("crossword.crew.team@gmail.com");
    expect(DEFAULT_FEEDBACK_EMAIL).toBe("crossword.crew.team@gmail.com");
    expect(loadConfig({ SESSION_SECRET: "s", FEEDBACK_EMAIL: " me@example.com " }).feedbackEmail).toBe("me@example.com");
  });

  test("requires a session secret", () => {
    expect(() => loadConfig({})).toThrow("SESSION_SECRET");
  });

  test("turns optional features off when their variables are missing", () => {
    const config = loadConfig({ SESSION_SECRET: "s" });
    expect(config.google).toBeNull();
    expect(config.email).toBeNull();
    expect(config.port).toBe(3000);
    expect(config.db.port).toBe(5432);
  });
});

test("parseTrustProxy only trusts a proxy in production unless told otherwise", () => {
  expect(parseTrustProxy(undefined, false)).toBe(false);
  expect(parseTrustProxy(undefined, true)).toBe(1);
  expect(parseTrustProxy("false", true)).toBe(false);
  expect(parseTrustProxy("2", false)).toBe(2);
  expect(parseTrustProxy("loopback", false)).toBe("loopback");
});

test("parseWelcomeGridId defaults to puzzle 1 and can be turned off", () => {
  expect(parseWelcomeGridId(undefined)).toBe(1);
  expect(parseWelcomeGridId("none")).toBeNull();
  expect(parseWelcomeGridId("7")).toBe(7);
  expect(() => parseWelcomeGridId("abc")).toThrow("WELCOME_GRID_ID");
});
