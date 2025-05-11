import { StaticReference } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import {
  App,
  Component,
  FileModel,
  Fragment,
} from "../models/_interfaces/_.js";
import { File } from "./file/_.js";
import { Project } from "./project/project.js";

export interface Infrastructure {
  // Resources

  file(url: string): File;
  project(id: string): Project;

  component(url: string): FileModel<Component>;
  createComponent(): Promise<FileModel<Component>>;

  app(url: string): FileModel<App>;
  createApp(): Promise<FileModel<App>>;

  fragment(url: string): Fragment | undefined;
  fragment$(url: string): Observable<Fragment | undefined>;

  // References

  resolveStaticReference<T>(ref: StaticReference): Promise<T>;
}
