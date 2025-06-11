import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Component } from "../models/component/_.js";
import { Fragment } from "../models/fragment/_.js";

export interface RenderingEnvironment {
  project: Project;

  component: Component | undefined;
  component$: Observable<Component | undefined>;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;
}
