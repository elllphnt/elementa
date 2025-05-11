// src/runtime/style/stylesheet_instance.ts

import { Stylesheet } from "@elllphnt/elementa-models";
import { BehaviorSubject } from "rxjs";
import { Runtime } from "../../runtime/runtime";
import { ElementaInstanceType, Instance } from "../instance";
import { StyleCascadeResolver } from "./cascade";
import { StyleInstance } from "./style";

export class StyleSheetInstance extends Instance {
  readonly stylesheet: Stylesheet;
  readonly cascadeResolver: StyleCascadeResolver;

  private _styles$ = new BehaviorSubject<Record<string, StyleInstance>>({});

  get parentStylesheetInstance(): StyleSheetInstance | undefined {
    return this.cascadeResolver.getParentStylesheetInstance();
  }

  get styles$() {
    return this._styles$.asObservable();
  }
  get styles(): Record<string, StyleInstance> {
    return this._styles$.value;
  }

  style(selector: string): StyleInstance {
    let style = this.styles[selector];
    if (!style) {
      style = new StyleInstance({
        selector,
        stylesheet: this,
      });
      this._styles$.next({ ...this.styles, [selector]: style });
    }
    return style;
  }

  constructor({
    stylesheet,
    cascadeResolver,
    parent,
    runtime,
  }: {
    stylesheet: Stylesheet;
    cascadeResolver: StyleCascadeResolver;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.StyleSheet,
      runtime,
      parent,
    });
    this.stylesheet = stylesheet;
    this.cascadeResolver = cascadeResolver;

    this.addDisposer(() => {
      this._styles$.complete();
      Object.values(this._styles$.value).forEach((style) => style.dispose());
    });
  }
}
