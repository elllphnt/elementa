import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { ContainerElement } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import type { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import type { ElementInstance } from "./_element.js";
import { createElementInstance } from "./_element.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

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
    environment: ElementRuntimeEnvironment;
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
    });
  }
}
