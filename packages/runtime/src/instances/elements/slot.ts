import { SlotElement } from "@elllphnt/elementa-core";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import { createElementInstance, ElementInstance } from "./_element.js";

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
    environment: FragmentEnvironment;
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
