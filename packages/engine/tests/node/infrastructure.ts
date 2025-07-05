import type { PackageData } from "@elllphnt/elementa-base";
import type { JsonRecordState } from "@elllphnt/elementa-json-backend";
import { JsonBackend } from "@elllphnt/elementa-json-backend";
import type {
  FileModelType,
  FileModelTypeName,
} from "@elllphnt/elementa-models";
import {
  AsyncResourceStatus,
  Content,
  File,
  FileModelAdaptor,
  Infrastructure,
  Project,
} from "@elllphnt/elementa-models";
import { of, type Observable } from "rxjs";

const jsonBackend = new JsonBackend();

export type TestFileData = {
  id: string;
  path: string;
  content: string;
};
export type TestProjectData = {
  id: string;
  files: TestFileData[];
};
export type TestInfrastructureData = {
  projects: TestProjectData[];
};

export class TestFileContent extends Content<TestFile> {
  get text(): string {
    return this.file.data.content;
  }
  get text$(): Observable<string> {
    return of(this.text);
  }
  constructor({ file }: { file: TestFile }) {
    super({ file });
    this.setStatus(AsyncResourceStatus.Resolved);
  }
}

export class TestFileModelAdaptor<
  N extends FileModelTypeName
> extends FileModelAdaptor<N, TestFile> {
  private _state: JsonRecordState<any>;

  get state(): FileModelType<N>["state"] | undefined {
    return this._state;
  }
  get state$(): Observable<FileModelType<N>["state"] | undefined> {
    return of(this._state);
  }

  constructor({ file, modelType }: { file: TestFile; modelType: N }) {
    super({ file, modelType });

    const data = JSON.parse(file.data.content || "{}");
    this._state = jsonBackend.createRecordState(data);
    this._state.initialize();
    this.addInitializer(() => {
      this.setStatus(AsyncResourceStatus.Resolved);
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }
}

export class TestFile extends File {
  readonly data: TestFileData;

  get path(): string | undefined {
    return this.data.path;
  }
  get path$(): Observable<string | undefined> {
    return of(this.data.path);
  }

  constructor({ data, project }: { data: TestFileData; project: TestProject }) {
    super({ id: data.id, project });
    this.data = data;
  }
}

export class TestProject extends Project {
  private files: Record<string, TestFile> = {};
  private adaptors: Record<string, FileModelAdaptor<any, TestFile>> = {};
  private contents: Record<string, TestFileContent> = {};

  file(id: string): TestFile {
    const file = this.files[id];
    if (!file) {
      throw new Error(`File not found. id: ${id}`);
    }
    return file;
  }
  fileModelAdaptor<T extends FileModelTypeName>(
    modelType: T,
    fileId: string
  ): TestFileModelAdaptor<T> {
    const key = `${modelType}:${fileId}`;
    if (!this.adaptors[key]) {
      const file = this.file(fileId);
      const adaptor = new TestFileModelAdaptor({ file, modelType });
      adaptor.initialize();
      this.adaptors[key] = adaptor;
    }
    return this.adaptors[key] as TestFileModelAdaptor<T>;
  }
  fileAtPath(path: string): TestFile | undefined {
    for (const file of Object.values(this.files)) {
      if (file.path === path) {
        return file;
      }
    }
    return undefined;
  }
  fileAtPath$(path: string): Observable<TestFile | undefined> {
    return of(this.fileAtPath(path));
  }
  content(fileId: string): TestFileContent {
    if (!this.contents[fileId]) {
      const file = this.file(fileId);
      const content = new TestFileContent({ file });
      content.initialize();
      this.contents[fileId] = content;
    }
    return this.contents[fileId];
  }

  constructor({
    data,
    infrastructure,
  }: {
    data: TestProjectData;
    infrastructure: TestInfrastructure;
  }) {
    super({ id: data.id, infrastructure });

    for (const fileData of data.files) {
      const file = new TestFile({ data: fileData, project: this });
      file.initialize();
      this.files[file.id] = file;
    }

    this.addDisposer(() => {
      for (const file of Object.values(this.files)) {
        file.dispose();
      }
      for (const adaptor of Object.values(this.adaptors)) {
        adaptor.dispose();
      }
      for (const content of Object.values(this.contents)) {
        content.dispose();
      }
      this.files = {};
      this.adaptors = {};
      this.contents = {};
    });
  }

  async installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]> {
    return packages.map((pkg) => ({
      name: pkg.name,
      version: pkg.version || "latest",
      registry: pkg.registry || "npm",
    }));
  }
}

export class TestInfrastructure extends Infrastructure {
  private projects: Record<string, TestProject> = {};

  project(id: string): TestProject {
    const project = this.projects[id];
    if (!project) {
      throw new Error(`Project not found. id: ${id}`);
    }
    return project;
  }

  constructor({ data }: { data: TestInfrastructureData }) {
    super();

    for (const projectData of data.projects) {
      const project = new TestProject({
        data: projectData,
        infrastructure: this,
      });
      project.initialize();
      this.projects[project.id] = project;
    }

    this.addDisposer(() => {
      for (const project of Object.values(this.projects)) {
        project.dispose();
      }
      this.projects = {};
    });
  }
}
