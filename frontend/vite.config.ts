import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// API routes served by the backend. In development, Vite forwards them to it.
const BACKEND_URL = "http://localhost:3000";
const API_PREFIXES = ["/auth", "/users", "/email"];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: Object.fromEntries(API_PREFIXES.map((prefix) => [prefix, BACKEND_URL])),
  },
  test: {
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
  },
});
