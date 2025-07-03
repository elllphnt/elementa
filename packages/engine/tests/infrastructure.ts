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
    this.addInitializer(() => {
      this.setStatus(AsyncResourceStatus.Resolved);
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
  private readonly files: Record<string, TestFile> = {};

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
    const file = this.file(fileId);
    const adaptor = new TestFileModelAdaptor<T>({ file, modelType });
    adaptor.initialize();
    return adaptor;
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
    const file = this.file(fileId);
    const content = new TestFileContent({ file });
    content.initialize();
    return content;
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
  private readonly projects: Record<string, TestProject> = {};

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
  }
}
