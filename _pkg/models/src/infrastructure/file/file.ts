import { Observable } from "rxjs";
import { Project } from "../project/project";
import { Resource } from "../resource";

export abstract class File extends Resource {
  abstract get project(): Project;

  abstract get name(): string;
  abstract get name$(): Observable<string>;

  abstract get type(): string;
  abstract get type$(): Observable<string>;

  abstract get content(): string;
  abstract get content$(): Observable<string>;

  abstract getContent(): Promise<string>;
}
