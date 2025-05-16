import { Observable } from "rxjs";
import { Project } from "../project/project.js";
import { AsyncResource } from "../resource.js";

export interface FileContent extends AsyncResource {
  text: string | undefined;
  text$: Observable<string | undefined>;
}

export interface File extends AsyncResource {
  id: string;
  content: FileContent;

  project: Project;
  url: string;

  name: string | undefined;
  name$: Observable<string | undefined>;
}
