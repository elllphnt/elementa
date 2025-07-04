import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { SlotFill } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import type { ElementInstance } from "../elements/_element.js";
import { createElementInstance } from "../elements/_element.js";
import type { ElementRuntimeEnvironment } from "../elements/_environment/environment.js";
import type { Instance } from "../instance.js";
import { ElementaInstanceType } from "../instance.js";
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
    this.addLifecycle(this.stylesheet);

    const contentSubscription = this.model.content$.subscribe((content) => {
      const [newContent, removed] = reconcileList({
        sources: content,
        targets: this.content,
        sourceRef: (e) => e,
        targetRef: (i) => i.element,
        create: (element) => {
          const instance = createElementInstance({
            element,
            environment: this.environment,
            parent: this,
          });
          this.addLifecycle(instance);
          return instance;
        },
      });
      this._content$.next(newContent);
      removed.forEach((instance) => {
        this.removeLifecycle(instance);
        instance.dispose();
      });
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();

      this.content.forEach((instance) => {
        this.removeLifecycle(instance);
        instance.dispose();
      });
      this._content$.next([]);
      this._content$.complete();

      if (this.stylesheet) {
        this.removeLifecycle(this.stylesheet);
        this.stylesheet.dispose();
      }
    });
  }
}
