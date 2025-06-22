import { BehaviorSubject, map } from "rxjs";
import type { FileData, ProjectData } from "./types.js";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export class Backend {
  private baseUrl: string;

  private _projects$ = new BehaviorSubject<Record<string, ProjectData>>({});
  private _files$ = new BehaviorSubject<
    Record<string, Record<string, FileData>>
  >({});
  private _fileContents$ = new BehaviorSubject<
    Record<string, Record<string, string>>
  >({});
  private _projectsStatus$ = new BehaviorSubject<"idle" | "loading" | "loaded">(
    "idle"
  );
  private _filesStatus$ = new BehaviorSubject<
    Record<string, "idle" | "loading" | "loaded">
  >({});
  private _fileContentsStatus$ = new BehaviorSubject<
    Record<string, Record<string, "idle" | "loading" | "loaded">>
  >({});

  files$ = this._files$.asObservable();
  get files(): Record<string, Record<string, FileData>> {
    return this._files$.getValue();
  }

  fileContents$ = this._fileContents$.asObservable();
  get fileContents(): Record<string, Record<string, string>> {
    return this._fileContents$.getValue();
  }

  projects$ = this._projects$
    .asObservable()
    .pipe(map((projects) => Object.values(projects)));
  get projects(): ProjectData[] {
    return Object.values(this._projects$.getValue());
  }

  projectsStatus$ = this._projectsStatus$.asObservable();
  get projectsStatus(): "idle" | "loading" | "loaded" {
    return this._projectsStatus$.getValue();
  }

  filesStatus$ = this._filesStatus$.asObservable();
  get filesStatus(): Record<string, "idle" | "loading" | "loaded"> {
    return this._filesStatus$.getValue();
  }

  fileContentsStatus$ = this._fileContentsStatus$.asObservable();
  get fileContentsStatus(): Record<
    string,
    Record<string, "idle" | "loading" | "loaded">
  > {
    return this._fileContentsStatus$.getValue();
  }

  project(id: string): ProjectData | undefined {
    return this._projects$.value[id];
  }
  project$(id: string) {
    return this._projects$.asObservable().pipe(map((projects) => projects[id]));
  }

  file(projectId: string, fileId: string): FileData | undefined {
    return this.files[projectId]?.[fileId];
  }
  file$(projectId: string, fileId: string) {
    return this._files$
      .asObservable()
      .pipe(map((files) => files[projectId]?.[fileId]));
  }

  projectFiles(projectId: string): FileData[] {
    return Object.values(this.files[projectId] || {});
  }
  projectFiles$(projectId: string) {
    return this._files$
      .asObservable()
      .pipe(map((files) => Object.values(files[projectId] || {})));
  }

  fileContent(projectId: string, fileId: string): string | undefined {
    return this.fileContents[projectId]?.[fileId];
  }
  fileContent$(projectId: string, fileId: string) {
    return this._fileContents$
      .asObservable()
      .pipe(map((contents) => contents[projectId]?.[fileId]));
  }

  projectFilesStatus(projectId: string): "idle" | "loading" | "loaded" {
    return this.filesStatus[projectId] || "idle";
  }
  projectFilesStatus$(projectId: string) {
    return this._filesStatus$
      .asObservable()
      .pipe(map((status) => status[projectId] || "idle"));
  }

  fileContentStatus(
    projectId: string,
    fileId: string
  ): "idle" | "loading" | "loaded" {
    return this.fileContentsStatus[projectId]?.[fileId] || "idle";
  }
  fileContentStatus$(projectId: string, fileId: string) {
    return this._fileContentsStatus$
      .asObservable()
      .pipe(map((status) => status[projectId]?.[fileId] || "idle"));
  }

  constructor() {
    this.baseUrl = SERVER_URL;
  }

  async fetchProjects() {
    if (this.projectsStatus === "loading") return; // Prevent multiple concurrent fetches

    this._projectsStatus$.next("loading");
    try {
      const response = await fetch(`${this.baseUrl}/projects`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const projectsArray = await response.json();
      const projectsRecord = projectsArray.reduce(
        (acc: Record<string, ProjectData>, project: ProjectData) => {
          acc[project.id] = project;
          return acc;
        },
        {}
      );
      this._projects$.next(projectsRecord);
      this._projectsStatus$.next("loaded");
    } catch (error) {
      this._projectsStatus$.next("idle");
      throw error;
    }
  }
  async fetchProjectFiles(projectId: string): Promise<FileData[]> {
    if (this.filesStatus[projectId] === "loading") return []; // Prevent multiple concurrent fetches

    const currentStatus = this._filesStatus$.getValue();
    this._filesStatus$.next({
      ...currentStatus,
      [projectId]: "loading",
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/projects/${projectId}/files`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch project files");
      }
      const files = await response.json();

      // Update the files structure to be Record<projectId, Record<fileId, FileData>>
      const currentFiles = this._files$.getValue();
      const filesRecord = files.reduce(
        (acc: Record<string, FileData>, file: FileData) => {
          acc[file.id] = file;
          return acc;
        },
        {}
      );

      this._files$.next({
        ...currentFiles,
        [projectId]: filesRecord,
      });

      const updatedStatus = this._filesStatus$.getValue();
      this._filesStatus$.next({
        ...updatedStatus,
        [projectId]: "loaded",
      });
      return files;
    } catch (error) {
      const currentStatus = this._filesStatus$.getValue();
      this._filesStatus$.next({
        ...currentStatus,
        [projectId]: "idle",
      });
      throw error;
    }
  }
  async fetchFileContent(projectId: string, fileId: string): Promise<string> {
    // Prevent multiple concurrent fetches of the same file
    const currentStatus = this.fileContentsStatus[projectId]?.[fileId];
    if (currentStatus === "loading") return "";

    // Set loading status
    const currentFileContentsStatus = this._fileContentsStatus$.getValue();
    this._fileContentsStatus$.next({
      ...currentFileContentsStatus,
      [projectId]: {
        ...currentFileContentsStatus[projectId],
        [fileId]: "loading",
      },
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/projects/${projectId}/files/${fileId}/content`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch file content");
      }
      const content = await response.text();

      // Update the file contents structure
      const currentContents = this._fileContents$.getValue();
      this._fileContents$.next({
        ...currentContents,
        [projectId]: {
          ...currentContents[projectId],
          [fileId]: content,
        },
      });

      // Set loaded status
      const updatedStatus = this._fileContentsStatus$.getValue();
      this._fileContentsStatus$.next({
        ...updatedStatus,
        [projectId]: {
          ...updatedStatus[projectId],
          [fileId]: "loaded",
        },
      });

      return content;
    } catch (error) {
      // Reset to idle status on error
      const currentStatus = this._fileContentsStatus$.getValue();
      this._fileContentsStatus$.next({
        ...currentStatus,
        [projectId]: {
          ...currentStatus[projectId],
          [fileId]: "idle",
        },
      });
      throw error;
    }
  }

  addProject(project: ProjectData) {
    const currentProjects = this._projects$.getValue();
    this._projects$.next({
      ...currentProjects,
      [project.id]: project,
    });
  }
  removeProject(projectId: string) {
    const currentProjects = { ...this._projects$.getValue() };
    delete currentProjects[projectId];
    this._projects$.next(currentProjects);
    // Also remove associated files and contents
    const currentFiles = { ...this._files$.getValue() };
    delete currentFiles[projectId];
    this._files$.next(currentFiles);
    const currentContents = { ...this._fileContents$.getValue() };
    delete currentContents[projectId];
    this._fileContents$.next(currentContents);
    // Remove file contents status
    const currentContentsStatus = { ...this._fileContentsStatus$.getValue() };
    delete currentContentsStatus[projectId];
    this._fileContentsStatus$.next(currentContentsStatus);
  }
  addFile(projectId: string, file: FileData) {
    const currentFiles = this._files$.getValue();
    const projectFiles = currentFiles[projectId] || {};
    this._files$.next({
      ...currentFiles,
      [projectId]: {
        ...projectFiles,
        [file.id]: file,
      },
    });
  }
  removeFile(projectId: string, fileId: string) {
    const currentFiles = this._files$.getValue();
    const projectFiles = { ...currentFiles[projectId] };
    delete projectFiles[fileId];
    this._files$.next({
      ...currentFiles,
      [projectId]: projectFiles,
    });

    // Also remove the file content if it exists
    const currentContents = this._fileContents$.getValue();
    if (currentContents[projectId]) {
      const projectContents = { ...currentContents[projectId] };
      delete projectContents[fileId];
      this._fileContents$.next({
        ...currentContents,
        [projectId]: projectContents,
      });
    }

    // Remove file content status
    const currentContentsStatus = this._fileContentsStatus$.getValue();
    if (currentContentsStatus[projectId]) {
      const projectContentsStatus = { ...currentContentsStatus[projectId] };
      delete projectContentsStatus[fileId];
      this._fileContentsStatus$.next({
        ...currentContentsStatus,
        [projectId]: projectContentsStatus,
      });
    }
  }
  addFileContent(projectId: string, fileId: string, content: string) {
    const currentContents = this._fileContents$.getValue();
    const projectContents = currentContents[projectId] || {};
    this._fileContents$.next({
      ...currentContents,
      [projectId]: {
        ...projectContents,
        [fileId]: content,
      },
    });
  }
  removeFileContent(projectId: string, fileId: string) {
    const currentContents = this._fileContents$.getValue();
    if (currentContents[projectId]) {
      const projectContents = { ...currentContents[projectId] };
      delete projectContents[fileId];
      this._fileContents$.next({
        ...currentContents,
        [projectId]: projectContents,
      });
    }
  }
}

export const backend = new Backend();
