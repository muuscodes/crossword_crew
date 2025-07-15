import session from "express-session";
import cors from "cors";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
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
    secure: NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 2, // 2 hour session
    sameSite: NODE_ENV === "production" ? "None" : "Lax",
  },
});

export const corsMiddleware = cors({
  origin: "http://localhost:3000",
  methods: "POST, GET, PUT, DELETE, PATCH",
  allowedHeaders: "Content-Type",
  credentials: true,
});
