import type { FileData, ProjectData } from "./types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export class ElementaAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SERVER_URL;
  }

  async getProjects(): Promise<ProjectData[]> {
    const response = await fetch(`${this.baseUrl}/projects`);
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    return response.json();
  }

  async getProject(projectId: string): Promise<ProjectData> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }
    return response.json();
  }

  async getFiles(
    projectId: string,
    pathPrefix?: string,
    depth?: number
  ): Promise<FileData[]> {
    const params = new URLSearchParams();
    if (pathPrefix) params.append("path", pathPrefix);
    if (depth !== undefined) params.append("depth", depth.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/projects/${projectId}/files${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }
    return response.json();
  }

  async getFile(projectId: string, fileId: string): Promise<FileData> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/files/${fileId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }
    return response.json();
  }

  async getFileContent(projectId: string, fileId: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/files/${fileId}/content`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch file content");
    }
    return response.text();
  }

  async getFileByPath(projectId: string, filePath: string): Promise<FileData> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/file?path=${encodeURIComponent(
        filePath
      )}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch file by path");
    }
    return response.json();
  }
}

export const elementaAPI = new ElementaAPI();
