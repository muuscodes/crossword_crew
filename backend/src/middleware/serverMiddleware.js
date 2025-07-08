import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const SESSION_SECRET = process.env.SESSION_SECRET || "63n632efg7gewj320n3";

export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 2, // 2 hour session
  },
});

export const corsMiddleware = cors({
  origin: "http://localhost:5173",
  methods: "POST, GET, PUT, DELETE",
  allowedHeaders: "Content-Type",
  credentials: true,
});
