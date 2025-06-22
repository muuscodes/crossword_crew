import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();
const pw = process.env.DB_ENCRYPTED_PASSWORD;

const createClient = () => {
  return new Client({
    user: "admin",
    host: "localhost",
    database: "crossword_crew",
    password: pw,
    port: 5432,
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
