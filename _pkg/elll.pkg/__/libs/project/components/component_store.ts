import { ComponentStore } from "@repo/elementa";
import { Elll } from "../../../elll/elll";
import { ElllProject } from "../project";
import { ElllComponent } from "./component";

export class ElllComponentStore extends ComponentStore {
  readonly project: ElllProject;

  private _components = new Map<string, ElllComponent>();

  get elll(): Elll {
    return this.project.elll;
  }

  component(url: string): ElllComponent {
    let component = this._components.get(url);
    if (!component) {
      component = new ElllComponent({
        url,
        elll: this.elll,
      });
      this._components.set(url, component);
    }
    return component;
  }
  createComponent(): Promise<ElllComponent | undefined> {
    throw new Error("Method not implemented.");
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;
  }
}
