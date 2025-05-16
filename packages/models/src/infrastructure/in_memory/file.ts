import { ValueState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { AsyncResourceStatus } from "../interfaces/_.js";
import { File, FileContent } from "../interfaces/file/file.js";
import { makeFileUrl } from "../interfaces/file/url.js";
import { InMemoryProject } from "./project.js";
import { InMemoryResource } from "./resource.js";

export interface InMemoryFileData {
  id: string;
  projectId: string;
  name: string;
  content: string;
}

export class InMemoryFileContent
  extends InMemoryResource
  implements FileContent
{
  readonly file: InMemoryFile;

  get text(): string | undefined {
    return this.file.contentValue;
  }
  get text$(): Observable<string | undefined> {
    return this.file.contentValue$;
  }

  constructor({
    id,
    file,
    status,
  }: {
    id: string;
    file: InMemoryFile;
    status?: AsyncResourceStatus;
  }) {
    super({ id, status });
    this.file = file;
  }

  async getContent(): Promise<string | undefined> {
    return this.file.getContent();
  }
}

export class InMemoryFile extends InMemoryResource implements File {
  readonly project: InMemoryProject;
  readonly content: InMemoryFileContent;

  private _state: ValueState<
    Omit<InMemoryFileData, "id" | "projectId"> | undefined
  >;

  get url(): string {
    return makeFileUrl({
      projectId: this.project.id,
      fileId: this.id,
    });
  }

  get name(): string | undefined {
    return this._state.value?.name;
  }
  get name$(): Observable<string | undefined> {
    return this._state.value$.pipe(map((state) => state?.name));
  }

  get contentValue(): string | undefined {
    return this._state.value?.content;
  }
  get contentValue$(): Observable<string | undefined> {
    return this._state.value$.pipe(map((state) => state?.content));
  }

  constructor({
    id,
    project,
    data,
    status,
  }: {
    id: string;
    project: InMemoryProject;
    data?: Omit<InMemoryFileData, "id" | "projectId">;
    status?: AsyncResourceStatus;
  }) {
    super({ id, status });
    this.project = project;
    this._state = new ValueState<
      Omit<InMemoryFileData, "id" | "projectId"> | undefined
    >({ init: data });
    this.content = new InMemoryFileContent({
      id: this.id,
      file: this,
      status,
    });
  }

  async getContent(): Promise<string | undefined> {
    return this._state.value?.content;
  }

  update(data: InMemoryFileData): void {
    this._state.setValue(data);
  }

  toJSON(): InMemoryFileData | undefined {
    const data = this._state.value;
    if (data) {
      return {
        id: this.id,
        projectId: this.project.id,
        name: data.name,
        content: data.content,
      };
    } else {
      return undefined;
    }
  }
}
