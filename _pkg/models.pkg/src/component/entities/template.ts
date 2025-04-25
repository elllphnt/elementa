import { Component } from "../component";
import { fragmentVariants } from "./_";
import { Fragment } from "./fragment";

export class Template extends Fragment {
  get name() {
    return this.component.name;
  }
  get name$() {
    return this.component.name$;
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      component,
      variant: fragmentVariants.template,
    });
  }
}
