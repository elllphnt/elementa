import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Fragment } from "../fragment/_.js";

export interface ElementaEnvironment {
  project: Project;

  get hostUrl(): string | undefined;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;
}
