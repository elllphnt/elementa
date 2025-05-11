import { Observable } from "rxjs";
import { Project } from "../project/project.js";
import { Resource } from "../resource.js";
import { makeFileUrl } from "./url.js";

export abstract class File extends Resource {
  readonly project: Project;

  get url() {
    return makeFileUrl({
      projectId: this.project.id,
      fileId: this.id,
    });
  }

  abstract get name(): string;
  abstract get name$(): Observable<string>;

  abstract get type(): string;
  abstract get type$(): Observable<string>;

  abstract get content(): string;
  abstract get content$(): Observable<string>;

  constructor({ id, project }: { id: string; project: Project }) {
    super({ id });
    this.project = project;
  }

  abstract getContent(): Promise<string>;
}
