import { Request, Response, Router } from "express";
import { SSEService } from "../services/sse";

export function createSSERoutes(sseService: SSEService): Router {
  const router = Router();

  router.get("/events", (req: Request, res: Response) => {
    sseService.handleConnection(req, res);
  });

  return router;
}
