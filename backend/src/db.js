import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
const user = process.env.DB_USER;
const pw = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const db_name = process.env.DB_NAME;

const pool = new Pool({
  user: user,
  password: pw,
  host: host,
  port: port,
  database: db_name,
});

console.log("Database connection pool created");

let isShuttingDown = false;
const shutdownDatabase = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("Attempting to close database connection...");
  try {
    await pool.end();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Error closing the database connection", err.stack);
  }
};

export { pool, shutdownDatabase };
