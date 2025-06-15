import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { createInfrastructure } from "./infrastructure/factory";
import { createProjectRoutes } from "./routes/projects";

// Load environment variables
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const infrastructureUrl = process.env.INFRASTRUCTURE_URL;

if (!infrastructureUrl) {
  console.error("INFRASTRUCTURE_URL environment variable is required");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());

// Create infrastructure instance
let infrastructure;
try {
  infrastructure = createInfrastructure(infrastructureUrl);
  console.log(`Infrastructure initialized: ${infrastructureUrl}`);
} catch (error) {
  console.error("Failed to initialize infrastructure:", error);
  process.exit(1);
}

// Routes
app.use("/projects", createProjectRoutes(infrastructure));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Elementa server is running on port ${port}`);
  console.log(`Infrastructure URL: ${infrastructureUrl}`);
});

export default app;
