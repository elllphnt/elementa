import { ValueState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { AsyncResourceStatus } from "../interfaces/_.js";
import { File } from "../interfaces/file/file.js";
import { makeFileUrl } from "../interfaces/file/url.js";
import { InMemoryProject } from "./project.js";
import { InMemoryResource } from "./resource.js";

export interface InMemoryFileData {
  id: string;
  projectId: string;
  name: string;
  content: string;
}

export class InMemoryFile extends InMemoryResource implements File {
  readonly project: InMemoryProject;
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

  get content(): string | undefined {
    return this._state.value?.content;
  }
  get content$(): Observable<string | undefined> {
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
