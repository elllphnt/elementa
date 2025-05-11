import { StaticReference } from "@elllphnt/elementa-base";
import { App } from "../app/app.js";
import { Component } from "../crdt/component/component.js";
import { File, ModelFile } from "./file/_.js";
import { Project } from "./project/project.js";

export interface Infrastructure {
  // Resources

  file(url: string): File;
  project(id: string): Project;

  component(url: string): ModelFile<Component>;
  createComponent(): Promise<ModelFile<Component>>;

  app(url: string): ModelFile<App>;
  createApp(): Promise<ModelFile<App>>;

  // References

  resolveStaticReference<T>(ref: StaticReference): Promise<T>;
}
