import express from "express";
import passport from "passport";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { shutdownDatabase } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
import {
  corsMiddleware,
  sessionMiddleware,
} from "./middleware/serverMiddleware.js";
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Basic middleware
app.use(express.json());
app.use(corsMiddleware);

// Serve static files from React app
app.use(express.static(path.resolve(__dirname, "../../frontend/dist")));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.all("/{*any}", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "../../frontend/dist/index.html"),
    (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(err.status).end();
      }
    }
  );
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const startServer = async () => {
  try {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Handle database shutdown
    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      await shutdownDatabase();
    };

    process.on("SIGINT", shutdown); // CTRL + C
    process.on("SIGTERM", shutdown); // Kill terminal
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
