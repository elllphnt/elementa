import { ComponentStore } from "@repo/elementa";
import {
  ComponentModel,
  componentModelConstructor,
} from "~/src/models/component";
import { IElll } from "~/src/types/elll";
import { ElllProject } from "../project";

export class ElllComponentStore extends ComponentStore {
  readonly project: ElllProject;

  get elll(): IElll {
    return this.project.elll;
  }

  component(url: string) {
    return this.elll.modelManager.getModel(
      componentModelConstructor.name,
      url,
    ) as ComponentModel;
  }
  createComponent(): Promise<ComponentModel | undefined> {
    throw new Error("Method not implemented.");
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;
  }
}
