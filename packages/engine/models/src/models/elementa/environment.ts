import type { Observable } from "rxjs";
import type { Project } from "~/project/project.js";
import type { Fragment } from "../fragment/fragment.js";

export interface ElementaEnvironment {
  project: Project;

  get hostUrl(): string | undefined;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;
}
