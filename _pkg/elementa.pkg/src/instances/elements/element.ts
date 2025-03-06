import { Element } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { map } from "rxjs";
import { FragmentEnvironment } from "../fragment/environment";
import { Instance } from "../instance";
import { ElementInstanceStyle } from "./_common/style";

export abstract class ElementInstance<
  E extends Element = Element,
> extends Instance<E> {
  readonly environment: FragmentEnvironment;
  readonly style: ElementInstanceStyle;

  get elementParent(): ElementInstance | null {
    if (this.parent instanceof ElementInstance) {
      return this.parent;
    } else {
      return null;
    }
  }

  get selector() {
    return [...this.environment.styleModifiers].sort().join(":");
  }
  get selector$() {
    return this.environment.styleModifiers$.pipe(
      map((styleModifiers) => [...styleModifiers].sort().join(":")),
    );
  }

  get hidden() {
    return this.entity.hidden[this.selector];
  }
  get hidden$() {
    return combineLatestOrEmpty([this.selector$, this.entity.hidden$]).pipe(
      map(([contextsString, hidden]) => hidden[contextsString]),
    );
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
    environment: FragmentEnvironment;
    parent: Instance | null;
  }) {
    super({
      entity: element,
      elementa: environment.elementa,
      parent,
    });
    this.environment = environment;
    this.style = new ElementInstanceStyle({
      element: this,
    });

    this.addDisposer(() => {
      this.style.dispose();
    });
  }
}
