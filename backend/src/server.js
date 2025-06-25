import express from "express";
import passport from "passport";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const PORT = process.env.PORT || 3000;
const app = express();
import { connectToDatabase } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name from the file path
const __dirname = dirname(__filename);

// Basic middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Serve static files from React app
app.use(express.static(path.resolve(__dirname, "../../frontend/dist")));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.all("*catchall", (req, res) => {
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

const startServer = async () => {
  try {
    const dbClient = await connectToDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

startServer();
