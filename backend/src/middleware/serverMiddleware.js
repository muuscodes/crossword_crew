import session from "express-session";
import cors from "cors";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET;

// Create a session store
const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pool,
    tableName: "session",
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 2, // 2 hour session
    sameSite: "Lax",
  },
});

export const corsMiddleware = cors({
  origin: "http://localhost:3000",
  methods: "POST, GET, PUT, DELETE, PATCH",
  allowedHeaders: "Content-Type",
  credentials: true,
});
