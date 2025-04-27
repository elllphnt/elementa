import * as y from "yjs";
import { Component } from "./component";
import { Fragment, FragmentVariant } from "./fragment";

export class Template extends Fragment {
  get name() {
    return this.component.name;
  }
  get name$() {
    return this.component.name$;
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component, FragmentVariant.Template);
  }
}
