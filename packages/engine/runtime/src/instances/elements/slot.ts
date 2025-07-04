import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { SlotElement } from "@elllphnt/elementa-models";
import type {
  Observable} from "rxjs";
import {
  BehaviorSubject,
  combineLatest,
  map,
  switchMap,
} from "rxjs";
import type { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import type { ElementInstance } from "./_element.js";
import { createElementInstance } from "./_element.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

export class SlotElementInstance extends BaseElementInstance<SlotElement> {
  private _placeholder$ = new BehaviorSubject<ElementInstance[]>([]);

  get placeholder$(): Observable<ElementInstance[]> {
    return this._placeholder$;
  }
  get placeholder(): ElementInstance[] {
    return this._placeholder$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(
      super.diagnosticLevel,
      ...this.placeholder.map((p) => p.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      super.diagnosticLevel$,
      this.placeholder$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(elements.map((e) => e.diagnosticLevel$))
        )
      ),
    ]).pipe(
      map(([own, placeholderLevels]) => Math.max(own, ...placeholderLevels))
    );
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: SlotElement;
    environment: ElementRuntimeEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const contentSubscription = combineLatestOrEmpty([
      this.element.placeholder$,
    ]).subscribe(([placeholder]) => {
      const [newContent, removed] = reconcileList({
        targets: this.placeholder,
        sources: placeholder,
        sourceRef: (e) => e,
        targetRef: (e) => e.element,
        create: (element) =>
          createElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._placeholder$.next(newContent);
      removed.forEach((instance) => {
        instance.dispose();
      });
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.placeholder.forEach((instance) => instance.dispose());
      this._placeholder$.next([]);
      this._placeholder$.complete();
    });
  }
}
