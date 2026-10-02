import pg from "pg";

export function createPool(dbConfig) {
  const pool = new pg.Pool(dbConfig);
  // Without a listener, an idle client losing its connection would crash the process.
  pool.on("error", (error) => console.error("Unexpected database error:", error));
  return pool;
}

// Wraps a pg Pool in the small interface the app uses, so tests can swap in an in-memory database.
//   query(text, params)  parameterized query
//   exec(sql)            run a multi-statement script (migrations)
//   transaction(work)    run work(tx) inside BEGIN/COMMIT, rolling back if it throws
export function createDb(pool) {
  return {
    query: (text, params) => pool.query(text, params),
    exec: (sql) => pool.query(sql),
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await work({
          query: (text, params) => client.query(text, params),
          exec: (sql) => client.query(sql),
        });
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
