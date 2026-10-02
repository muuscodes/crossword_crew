import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { afterEach, describe, expect, test, vi } from "vitest";
import { spaFallback } from "../src/app.js";
import { errorHandler } from "../src/middleware/errors.js";
import { createTestContext, signUp } from "./helpers.js";

let context;
afterEach(async () => {
  await context?.close();
  context = undefined;
});

async function builtFrontend() {
  const dir = await mkdtemp(path.join(tmpdir(), "dist-"));
  await mkdir(path.join(dir, "assets"));
  await writeFile(path.join(dir, "index.html"), "<!doctype html><title>Crossword Crew</title>");
  await writeFile(path.join(dir, "assets", "app-123.js"), "console.log('hi')");
  return dir;
}

describe("serving the frontend", () => {
  test("page routes get index.html and assets are cached", async () => {
    context = await createTestContext({ staticDir: await builtFrontend() });
    const page = await request(context.app).get("/library").expect(200);
    expect(page.text).toContain("Crossword Crew");
    expect(page.headers["cache-control"]).toBe("no-cache");

    const asset = await request(context.app).get("/assets/app-123.js").expect(200);
    expect(asset.headers["cache-control"]).toContain("immutable");
  });

  test("missing assets and unknown API routes return 404 instead of index.html", async () => {
    context = await createTestContext({ staticDir: await builtFrontend() });
    await request(context.app).get("/assets/missing.js").expect(404);
    const { agent } = await signUp(context.app, "ann");
    const response = await agent.get("/users/no/such/route").expect(404);
    expect(response.body).toEqual({ message: "Not found." });
  });
});

describe("spaFallback", () => {
  const fakeResponse = (error) => ({
    headersSent: false,
    sendFile: (file, options, callback) => callback(error),
    status: vi.fn().mockReturnThis(),
    type: vi.fn().mockReturnThis(),
    send: vi.fn(),
  });

  test("ignores a visitor cancelling the download instead of crashing", () => {
    const next = vi.fn();
    const aborted = Object.assign(new Error("Request aborted"), { code: "ECONNABORTED" });
    expect(() => spaFallback("index.html")({}, fakeResponse(aborted), next)).not.toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  test("explains a missing build", () => {
    const res = fakeResponse(Object.assign(new Error("missing"), { code: "ENOENT" }));
    spaFallback("index.html")({}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("errorHandler", () => {
  const run = (error) => {
    const res = { headersSent: false, status: vi.fn().mockReturnThis(), json: vi.fn() };
    vi.spyOn(console, "error").mockImplementation(() => {});
    errorHandler(error, {}, res, vi.fn());
    return res;
  };

  test("treats errors without a valid status as 500s and hides their details", () => {
    const res = run(new Error("database exploded"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong. Please try again." });
  });

  test("keeps client errors readable", () => {
    const res = run(Object.assign(new Error("Bad input"), { status: 400 }));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad input" });
  });
});
