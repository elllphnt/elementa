export type ElementaFileData = {
  id: string;
  projectId: string;
  path: string;
  type: string;
};

export type ElementaReferencedFileData = {
  url: string;
  path: string;
  type: string;
};

export interface ElementaInfrastructure {
  read(absoluteUrl: string): Promise<string>;
  getFile(absoluteUrl: string): Promise<ElementaReferencedFileData | undefined>;
  getFileAtPath(
    projectId: string,
    path: string
  ): Promise<ElementaReferencedFileData | undefined>;
}
