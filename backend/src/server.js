import express from "express";
import passport from "passport";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const PORT = process.env.PORT || 3000;
const app = express();
import { connectToDatabase } from "./db.js";

const aPath =
  "/Users/Nellilo/Desktop/Codine/post_2025/aprendizaje/learning_process/projects/crossword_crew/frontend/index.html";

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name from the file path
const __dirname = dirname(__filename);

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend/src"))); // index.html and App.css/App.tsx/main.tsx are not in the same spot, this may not work

// Serving up the HTML file from the /public directory
app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "../frontend", "index.html"));
  res.sendFile(aPath);
  res.status(200).send({
    message: "Welcome to the backend!",
  });
});

// app.get("/", (req, res) => {
//   res.status(200).send({
//     message: "Welcome to the backend!",
//   });
// });

// Routes
// app.use("/auth", authRoutes);
// app.use("/todos", authMiddleware, todoRoutes);

const startServer = async () => {
  try {
    const dbClient = await connectToDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

startServer();
