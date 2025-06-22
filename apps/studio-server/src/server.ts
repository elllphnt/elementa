import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { initializeInfrastructure } from "./infrastructure/factory";
import { createProjectRoutes } from "./routes/projects";
import { createSSERoutes } from "./routes/sse";
import { SSEService } from "./services/sse";

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

const sseService = new SSEService();
const infrastructure = initializeInfrastructure({
  url: infrastructureUrl,
  sseService,
});

console.log(`File watching and SSE services initialized for local storage`);

// Routes
app.use("/projects", createProjectRoutes(infrastructure));

// SSE routes (only if SSE service is available)
if (sseService) {
  app.use("/sse", createSSERoutes(sseService));
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Elementa server is running on port ${port}`);
  console.log(`Infrastructure URL: ${infrastructureUrl}`);
  if (sseService) {
    console.log(
      `SSE endpoint available at: http://localhost:${port}/sse/events`
    );
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");

  if (sseService) {
    sseService.closeAllConnections();
  }

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
