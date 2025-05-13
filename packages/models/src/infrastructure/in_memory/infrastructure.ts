import { StaticReference } from "@elllphnt/elementa-base";
import { assert } from "@elllphnt/elementa-utils";
import { Observable, of, switchMap } from "rxjs";
import {
  App,
  Component,
  FileModelAdaptor,
  Fragment,
} from "../../models/_interfaces/_.js";
import {
  isFragmentUrl,
  parseFragmentUrl,
} from "../../models/_interfaces/component/fragment/url.js";
import { AsyncResourceStatus } from "../interfaces/_.js";
import {
  isFileUrl,
  makeFileUrl,
  parseFileUrl,
} from "../interfaces/file/url.js";
import { Infrastructure } from "../interfaces/infrastructure.js";
import { InMemoryAppFileModelAdaptor } from "./adaptors/app.js";
import { InMemoryComponentFileModelAdaptor } from "./adaptors/component.js";
import { InMemoryFile, InMemoryFileData } from "./file.js";
import { ModelCache } from "./model_cache.js";
import { InMemoryProject, InMemoryProjectData } from "./project.js";

export interface InMemoryInfrastructureData {
  projects: InMemoryProjectData[];
  files: Array<InMemoryFileData>;
}

export class InMemoryInfrastructure implements Infrastructure {
  private _projects = new Map<string, InMemoryProject>();
  private _files = new Map<string, InMemoryFile>();
  private _modelCache = new ModelCache();

  private _fileKey = (projectId: string, fileId: string) =>
    `${projectId}/${fileId}`;
  private _projectKey = (id: string) => id;

  constructor(data?: InMemoryInfrastructureData) {
    if (data) {
      this.restore(data);
    }
  }

  file(url: string): InMemoryFile {
    if (!isFileUrl(url)) {
      throw new Error(`Invalid file URL: ${url}`);
    }

    const { projectId, fileId } = parseFileUrl(url);
    if (!projectId || !fileId) {
      throw new Error(`Invalid file URL: ${url}`);
    }

    const fileKey = this._fileKey(projectId, fileId);
    let file = this._files.get(fileKey);

    if (!file) {
      file = new InMemoryFile({
        id: fileId,
        project: this.project(projectId),
        status: AsyncResourceStatus.Missing,
      });
      this._files.set(fileKey, file);
    }

    return file;
  }

  project(id: string): InMemoryProject {
    const projectKey = this._projectKey(id);
    let project = this._projects.get(projectKey);
    if (!project) {
      project = new InMemoryProject({
        id,
        infrastructure: this,
        status: AsyncResourceStatus.Missing,
      });
      this._projects.set(projectKey, project);
    }
    return project;
  }

  component(url: string): FileModelAdaptor<Component> {
    // Check if component exists in cache
    const cachedComponent = this._modelCache.getComponent(url);
    if (cachedComponent) {
      return cachedComponent;
    }

    // Create file model wrapper
    const fileModel = new InMemoryComponentFileModelAdaptor({
      file: this.file(url),
    });

    this._modelCache.setComponent(url, fileModel);
    return fileModel;
  }

  app(url: string): FileModelAdaptor<App> {
    // Check if app exists in cache
    const cachedApp = this._modelCache.getApp(url);
    if (cachedApp) {
      return cachedApp;
    }

    // Create file model wrapper
    const fileModel = new InMemoryAppFileModelAdaptor({
      file: this.file(url),
    });

    this._modelCache.setApp(url, fileModel);
    return fileModel;
  }

  fragment(url: string): Fragment | undefined {
    assert(isFragmentUrl(url), "Invalid fragment URL");

    const { projectId, fileId, fragmentId } = parseFragmentUrl(url);
    assert(projectId && fileId, "Invalid fragment URL");

    const fileUrl = makeFileUrl({
      projectId,
      fileId,
    });
    return this.component(fileUrl).model?.fragment(fragmentId);
  }

  fragment$(url: string): Observable<Fragment | undefined> {
    assert(isFragmentUrl(url), "Invalid fragment URL");

    const { projectId, fileId, fragmentId } = parseFragmentUrl(url);
    assert(projectId && fileId, "Invalid fragment URL");

    const fileUrl = makeFileUrl({
      projectId,
      fileId,
    });
    const componentModel = this.component(fileUrl);
    return componentModel.model$.pipe(
      switchMap((model) => model?.fragment$(fragmentId) ?? of(undefined))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolveStaticReference<T>(_: StaticReference): Promise<T> {
    // Simple implementation that returns a mock object
    // In a real implementation, this would resolve based on the reference type
    return {} as T;
  }

  // Methods for creating resources

  createProject({ id, ...data }: InMemoryProjectData): InMemoryProject {
    const project = new InMemoryProject({
      id,
      data,
      infrastructure: this,
      status: AsyncResourceStatus.Resolved,
    });
    this._projects.set(id, project);
    return project;
  }

  createFile({ id, projectId, ...data }: InMemoryFileData): InMemoryFile {
    const project = this.project(projectId);
    const file = new InMemoryFile({
      id,
      data,
      project: project,
      status: AsyncResourceStatus.Resolved,
    });
    const fileKey = this._fileKey(projectId, id);
    this._files.set(fileKey, file);
    return file;
  }

  // Serialization and deserialization

  toJSON(): InMemoryInfrastructureData {
    const projects: InMemoryProjectData[] = [];
    const files: Array<InMemoryFileData> = [];

    this._projects.forEach((project) => {
      projects.push(project.toJSON());
    });

    this._files.forEach((file) => {
      const data = file.toJSON();
      if (data) {
        files.push(data);
      }
    });

    return {
      projects,
      files,
    };
  }

  restore(data: InMemoryInfrastructureData): void {
    this._modelCache.clear();
    this._projects.clear();
    this._files.clear();

    // First create all projects
    for (const projectData of data.projects) {
      this.createProject(projectData);
    }

    // Then create all files
    for (const fileData of data.files) {
      this.createFile(fileData);
    }
  }
}
