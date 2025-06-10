import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Fragment } from "../fragment/_.js";

export interface ElementEnvironment {
  project: Project;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;
}
