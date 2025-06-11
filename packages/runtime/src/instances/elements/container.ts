import { ContainerElement } from "@elllphnt/elementa-core";
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

export class ContainerElementInstance extends BaseElementInstance<ContainerElement> {
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(
      super.diagnosticLevel,
      ...this.content.map((c) => c.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      super.diagnosticLevel$,
      this.content$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(elements.map((e) => e.diagnosticLevel$))
        )
      ),
    ]).pipe(map(([own, contentLevels]) => Math.max(own, ...contentLevels)));
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: ContainerElement;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const contentSubscription = this.element.content$.subscribe((content) => {
      const [newContent, removed] = reconcileList({
        targets: this.content,
        sources: content,
        sourceRef: (c) => c,
        targetRef: (c) => c.element,
        create: (content) => {
          const instance = createElementInstance({
            element: content,
            environment: this.environment,
            parent: this,
          });
          return instance;
        },
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
    });
  }
}
