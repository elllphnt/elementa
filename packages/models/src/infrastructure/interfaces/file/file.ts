import { Observable } from "rxjs";
import { Project } from "../project/project.js";
import { AsyncResource } from "../resource.js";

export interface File extends AsyncResource {
  id: string;
  readonly project: Project;
  readonly url: string;

  readonly name: string | undefined;
  readonly name$: Observable<string | undefined>;

  readonly content: string | undefined;
  readonly content$: Observable<string | undefined>;

  getContent(): Promise<string | undefined>;
}
