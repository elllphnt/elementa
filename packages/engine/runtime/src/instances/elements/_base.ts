import type { Element } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { combineLatest, map } from "rxjs";
import type { Instance } from "../instance.js";
import { ElementaInstanceType } from "../instance.js";
import { ModelInstance } from "../model.js";
import { StyleSheetInstance } from "../stylesheet/stylesheet.js";
import type { ElementInstance } from "./_element.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

export abstract class BaseElementInstance<
  E extends Element = Element
> extends ModelInstance<E> {
  readonly environment: ElementRuntimeEnvironment;
  readonly element: E;
  readonly stylesheet: StyleSheetInstance;

  get parentElement(): ElementInstance | undefined {
    return this.parent?.type === ElementaInstanceType.Element
      ? (this.parent as ElementInstance)
      : undefined;
  }

  get diagnosticLevel(): number {
    return Math.max(this.ownDiagnosticLevel, this.stylesheet.diagnosticLevel);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.stylesheet.diagnosticLevel$,
    ]).pipe(map(([own, stylesheet]) => Math.max(own, stylesheet)));
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
    environment: ElementRuntimeEnvironment;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.Element,
      runtime: environment.runtime,
      parent,
      model: element,
    });

    this.environment = environment;
    this.element = element;
    this.stylesheet = new StyleSheetInstance({
      stylesheet: element.cssStyleSheet.stylesheet,
      runtime: environment.runtime,
      cascadeResolver: {
        getParentStylesheetInstance: () => this.parentElement?.stylesheet,
      },
    });

    this.addDisposer(() => {
      this.stylesheet.dispose();
    });
  }
}
