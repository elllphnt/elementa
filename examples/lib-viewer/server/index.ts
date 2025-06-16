import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Path to the build directory from .env file, with fallback
const BUILD_DIR = process.env.BUILD_DIR;

// Function to recursively get file tree
function getFileTree(dir: string, relativePath = ""): any {
  const items = fs.readdirSync(dir);

  return items.map((item) => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    const relPath = path.join(relativePath, item);

    if (stats.isDirectory()) {
      return {
        name: item,
        path: relPath,
        type: "directory",
        children: getFileTree(itemPath, relPath),
      };
    } else {
      return {
        name: item,
        path: relPath,
        type: "file",
      };
    }
  });
}

// API endpoint to get file tree
app.get("/api/filetree", (req, res) => {
  try {
    const tree = getFileTree(BUILD_DIR);
    res.json(tree);
  } catch (error) {
    console.error("Error fetching file tree:", error);
    res.status(500).json({ error: "Failed to get file tree" });
  }
});

// API endpoint to get file content
app.get("/api/file", (req, res) => {
  try {
    const filePath = req.query.path as string;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const fullPath = path.join(BUILD_DIR, filePath);

    // Prevent path traversal attacks
    if (!fullPath.startsWith(BUILD_DIR)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      return res.status(400).json({ error: "Path is a directory, not a file" });
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    res.json({ content });
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).json({ error: "Failed to read file" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
