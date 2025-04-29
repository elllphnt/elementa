import { Element } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstanceStyle } from "./_common/style";

export abstract class ElementInstance<
  E extends Element = Element
> extends Instance {
  readonly environment: FragmentEnvironment;
  readonly element: E;
  private _styles: Map<string, ElementInstanceStyle> = new Map();

  style(selector: string): ElementInstanceStyle {
    let style = this._styles.get(selector);
    if (!style) {
      style = new ElementInstanceStyle({
        element: this,
        selector,
      });
      this._styles.set(selector, style);
    }
    return style;
  }

  get selector() {
    return [...this.environment.styleModifiers].sort().join(":");
  }
  get selector$() {
    return this.environment.styleModifiers$.pipe(
      map((styleModifiers) => [...styleModifiers].sort().join(":"))
    );
  }

  get hidden() {
    return this.entity.hidden[this.selector];
  }
  get hidden$() {
    return combineLatestOrEmpty([this.selector$, this.entity.hidden$]).pipe(
      map(([contextsString, hidden]) => hidden[contextsString])
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

    this.addDisposer(() => {
      this._styles.forEach((style) => style.dispose());
    });
  }
}
