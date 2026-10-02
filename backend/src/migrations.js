import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

// Arbitrary constant: holding this advisory lock stops two processes migrating at once.
const MIGRATION_LOCK_ID = 727274;

async function migrationFiles(dir) {
  const files = await readdir(dir);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

async function ensureMigrationsTable(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

export async function pendingMigrations(db, dir = MIGRATIONS_DIR) {
  await ensureMigrationsTable(db);
  const { rows } = await db.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((row) => row.name));
  return (await migrationFiles(dir)).filter((file) => !applied.has(file));
}

// Applies every .sql file in dir that hasn't run yet, in filename order, one transaction per file.
export async function runMigrations(db, { dir = MIGRATIONS_DIR, log = () => {} } = {}) {
  await ensureMigrationsTable(db);
  const applied = [];
  for (const file of await migrationFiles(dir)) {
    const sql = await readFile(path.join(dir, file), "utf8");
    const ran = await db.transaction(async (tx) => {
      await tx.query("SELECT pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);
      const { rows } = await tx.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
      if (rows.length > 0) return false;
      await tx.exec(sql);
      await tx.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      return true;
    });
    if (ran) {
      applied.push(file);
      log(`Applied ${file}`);
    }
  }
  return applied;
}
