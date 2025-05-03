import * as y from "yjs";
import { attachComponent, Component } from "../../component/component";
import { FileModel } from "../file/_";
import { ComponentManager } from "../project/_";
import { InMemoryFileModel } from "./model";
import { InMemoryProject } from "./project";

export class InMemoryComponentManager extends ComponentManager {
  project: InMemoryProject;
  doc = new y.Doc();
  private _components: Map<string, InMemoryFileModel<Component>> = new Map();

  component(url: string): InMemoryFileModel<Component> {
    if (this._components.has(url)) {
      return this._components.get(url)!;
    }
    const file = this.project.infrastructure.file(url);
    const component = new InMemoryFileModel<Component>({
      file,
      enhancer: attachComponent,
      enhance: (ymap) => attachComponent(ymap, this.project),
      doc: this.doc,
    });
    this._components.set(url, component);
    return component;
  }
  createComponent(): Promise<FileModel<Component>> {
    throw new Error("Method not implemented.");
  }

  constructor({ project }: { project: InMemoryProject }) {
    super();
    this.project = project;
  }
}
