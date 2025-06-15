import { Request, Response, Router } from "express";
import { Infrastructure } from "../types";

export function createProjectRoutes(infrastructure: Infrastructure): Router {
  const router = Router();

  // GET /projects: Returns a list of all projects in the Elementa Infrastructure
  router.get("/", async (req: Request, res: Response) => {
    try {
      const projects = await infrastructure.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /projects/:project_id: Returns the details of a specific project by its ID
  router.get("/:project_id", async (req: Request, res: Response) => {
    try {
      const { project_id } = req.params;
      const project = await infrastructure.getProject(project_id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /projects/:project_id/files?path=:path_prefix,depth=:depth: Returns a list of files in a specific project, optionally filtered by path prefix and depth
  router.get("/:project_id/files", async (req: Request, res: Response) => {
    try {
      const { project_id } = req.params;
      const { path: pathPrefix, depth } = req.query;

      // Parse depth parameter if provided
      let depthNumber: number | undefined;
      if (depth !== undefined) {
        if (typeof depth === "string") {
          const parsedDepth = parseInt(depth, 10);
          if (!isNaN(parsedDepth) && parsedDepth >= 0) {
            depthNumber = parsedDepth;
          } else {
            return res
              .status(400)
              .json({ error: "Depth must be a non-negative integer" });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Depth must be a string representing an integer" });
        }
      }

      // Validate pathPrefix if provided
      const pathPrefixString =
        typeof pathPrefix === "string" ? pathPrefix : undefined;

      const files = await infrastructure.getFiles(
        project_id,
        pathPrefixString,
        depthNumber
      );
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /projects/:project_id/files/:file_id: Returns metadata about a specific file in a project
  router.get(
    "/:project_id/files/:file_id",
    async (req: Request, res: Response) => {
      try {
        const { project_id, file_id } = req.params;
        const file = await infrastructure.getFile(project_id, file_id);

        if (!file) {
          return res.status(404).json({ error: "File not found" });
        }

        res.json(file);
      } catch (error) {
        console.error("Error fetching file metadata:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  // GET /projects/:project_id/files/:file_id/content: Returns the content of a specific file in a project
  router.get(
    "/:project_id/files/:file_id/content",
    async (req: Request, res: Response) => {
      try {
        const { project_id, file_id } = req.params;
        const content = await infrastructure.getFileContent(
          project_id,
          file_id
        );

        if (content === null) {
          return res.status(404).json({ error: "File not found" });
        }

        res.send(content);
      } catch (error) {
        console.error("Error fetching file content:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  // GET /projects/:project_id/file?path=:file_path: Returns metadata about a specific file in a project by its path
  router.get("/:project_id/file", async (req: Request, res: Response) => {
    try {
      const { project_id } = req.params;
      const { path } = req.query;

      if (!path || typeof path !== "string") {
        return res.status(400).json({ error: "Path parameter is required" });
      }

      const file = await infrastructure.getFileByPath(project_id, path);

      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json(file);
    } catch (error) {
      console.error("Error fetching file by path:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
