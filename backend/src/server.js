import path from "node:path";
import { fileURLToPath } from "node:url";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb, createPool } from "./db.js";
import { createMailer } from "./mailer.js";
import { pendingMigrations } from "./migrations.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;
const staticDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");

async function main() {
  const config = loadConfig();
  const pool = createPool(config.db);
  const db = createDb(pool);

  const pending = await pendingMigrations(db);
  if (pending.length > 0) {
    await pool.end();
    throw new Error(
      `The database needs ${pending.length} migration(s) (${pending.join(", ")}). Run \`npm run migrate\` in the backend folder first.`,
    );
  }

  const PgSession = connectPgSimple(session);
  const sessionStore = new PgSession({ pool, tableName: "session" });
  const mailer = createMailer(config.email, { feedbackTo: config.feedbackEmail });
  if (!mailer.isConfigured) console.warn("EMAIL_USER / EMAIL_APP_PASS not set, so no emails will be sent.");
  if (!config.google) console.warn("Google sign-in is off because the GOOGLE_* variables aren't set.");

  const app = createApp({ db, mailer, config, sessionStore, staticDir });
  const server = app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down...`);
    // Give open requests a moment to finish, then exit regardless.
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    server.close(async (error) => {
      sessionStore.close();
      await pool.end().catch((poolError) => console.error("Error closing the database pool:", poolError));
      process.exit(error ? 1 : 0);
    });
    server.closeIdleConnections();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
