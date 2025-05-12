import { Element } from "@elllphnt/elementa-models";
import { combineLatest, map, Observable } from "rxjs";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { StyleSheetInstance } from "../stylesheet/stylesheet.js";

export abstract class ElementInstance<
  E extends Element = Element
> extends Instance {
  readonly environment: FragmentEnvironment;
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
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.Element,
      runtime: environment.runtime,
      parent,
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
