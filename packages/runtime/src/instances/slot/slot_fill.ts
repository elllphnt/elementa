import { SlotFill } from "@elllphnt/elementa-core";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { ElementInstance } from "../elements/_.js";
import { createElementInstance } from "../elements/_element.js";
import { ElementRuntimeEnvironment } from "../fragment/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { StyleSheetInstance } from "../stylesheet/stylesheet.js";

export class SlotFillInstance extends ModelInstance<SlotFill> {
  readonly environment: ElementRuntimeEnvironment;
  readonly slotId: string;
  readonly stylesheet: StyleSheetInstance;

  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get selector() {
    return [...this.environment.styleModifiers].sort().join(":");
  }
  get selector$() {
    return this.environment.styleModifiers$.pipe(
      map((styleModifiers) => [...styleModifiers].sort().join(":"))
    );
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.stylesheet.diagnosticLevel,
      ...this.content.map((c) => c.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.stylesheet.diagnosticLevel$,
      this.content$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(elements.map((e) => e.diagnosticLevel$))
        )
      ),
    ]).pipe(
      map(([own, stylesheetLevel, contentLevels]) =>
        Math.max(own, stylesheetLevel, ...contentLevels)
      )
    );
  }

  constructor({
    environment,
    parent,
    model,
  }: {
    environment: ElementRuntimeEnvironment;
    model: SlotFill;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.SlotFill,
      runtime: environment.runtime,
      parent,
    });
    this.environment = environment;

    this.stylesheet = new StyleSheetInstance({
      stylesheet: model.cssStyleSheet.stylesheet,
      runtime: environment.runtime,
      cascadeResolver: {
        getParentStylesheetInstance: () => undefined,
      },
    });

    const contentSubscription = this.model.content$.subscribe((content) => {
      const [newContent, removed] = reconcileList({
        sources: content,
        targets: this.content,
        sourceRef: (e) => e,
        targetRef: (i) => i.element,
        create: (element) =>
          createElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._content$.next(newContent);
      removed.forEach((instance) => {
        instance.dispose();
      });
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this.stylesheet?.dispose();
    });
  }
}
