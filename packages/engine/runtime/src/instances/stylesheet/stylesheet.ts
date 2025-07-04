import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Stylesheet } from "@elllphnt/elementa-models";
import type {
  Observable} from "rxjs";
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  switchMap,
} from "rxjs";
import type { Runtime } from "../../runtime/runtime.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import type { StyleCascadeResolver } from "./cascade.js";
import { StyleInstance } from "./style.js";

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

  get diagnosticLevel(): number {
    const parentLevel = this.parentStylesheetInstance?.diagnosticLevel ?? 0;
    return Math.max(
      this.ownDiagnosticLevel,
      parentLevel,
      ...Object.values(this.styles).map((s) => s.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.parentStylesheetInstance?.diagnosticLevel$ ?? of(0),
      this._styles$.pipe(
        switchMap((styles) =>
          combineLatestOrEmpty(
            Object.values(styles).map((s) => s.diagnosticLevel$)
          )
        )
      ),
    ]).pipe(
      map(([own, parent, styleLevels]) => Math.max(own, parent, ...styleLevels))
    );
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
