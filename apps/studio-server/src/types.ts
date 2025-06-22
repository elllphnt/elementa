export interface ProjectData {
  id: string;
  name: string;
}

export interface FileData {
  id: string;
  path: string;
  type: string;
}

export interface Infrastructure {
  getProjects(): Promise<ProjectData[]>;
  getProject(projectId: string): Promise<ProjectData | null>;
  getFile(projectId: string, fileId: string): Promise<FileData | null>;
  getFileContent(projectId: string, fileId: string): Promise<string | null>;
  getFileByPath(projectId: string, filePath: string): Promise<FileData | null>;
  getFiles(
    projectId: string,
    pathPrefix?: string,
    depth?: number
  ): Promise<FileData[]>;
}
