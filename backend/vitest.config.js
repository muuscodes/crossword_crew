import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Each test starts its own in-memory Postgres, which can take a few seconds on a busy machine,
    // and too many starting at once starve each other.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    maxWorkers: 3,
  },
});
