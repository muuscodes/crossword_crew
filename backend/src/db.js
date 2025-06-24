import { Client } from "pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
const user = process.env.DB_USER;
const pw = process.env.DB_ENCRYPTED_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const db_name = process.env.DB_NAME;

export const pool = new Pool({
  user: user,
  password: pw,
  host: host,
  port: port,
  database: db_name,
});

const createClient = () => {
  return new Client({
    user: user,
    host: host,
    database: db_name,
    password: pw,
    port: port,
  });
};

const connectToDatabase = async () => {
  const client = createClient();
  try {
    await client.connect();
    console.log("Successfully connected to db!");
  } catch (err) {
    console.error("Connection error", err.stack);
  } finally {
    await client.end();
  }
};

export { connectToDatabase, createClient };
