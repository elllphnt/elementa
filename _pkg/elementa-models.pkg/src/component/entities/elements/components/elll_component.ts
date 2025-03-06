import { entityTypes } from "@elllphnt/elll-element";
import { map } from "rxjs";
import { Component } from "../../../component";
import { ComponentElement } from "./component";

export class ElllComponentElement extends ComponentElement {
  get localComponent() {
    return this.absoluteComponentUrl
      ? this.project.componentManager.component(this.absoluteComponentUrl)
      : undefined;
  }
  get localComponent$() {
    return this.absoluteComponentUrl$.pipe(
      map((componentUrl) => {
        return componentUrl
          ? this.project.componentManager.component(componentUrl)
          : undefined;
      }),
    );
  }

  get componentName() {
    return this.localComponent?.name;
  }
  get componentName$() {
    return this.localComponent$.pipe(map((component) => component?.name));
  }

  get template() {
    return this.localComponent?.template ?? [];
  }
  get template$() {
    return this.localComponent$.pipe(map((component) => component?.template));
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.elements.components.elll, component });
  }
}
