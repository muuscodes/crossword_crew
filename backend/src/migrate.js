import { dbConfigFromEnv } from "./config.js";
import { createDb, createPool } from "./db.js";
import { runMigrations } from "./migrations.js";

const pool = createPool(dbConfigFromEnv());

try {
  const applied = await runMigrations(createDb(pool), { log: console.log });
  console.log(applied.length > 0 ? `Applied ${applied.length} migration(s).` : "Database is up to date.");
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
