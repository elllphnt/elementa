import { SlotElement } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";
import { createElementInstance } from "./_create";

export class SlotElementInstance extends ElementInstance<SlotElement> {
  private _placeholder$ = new BehaviorSubject<ElementInstance[]>([]);

  get placeholder$(): Observable<ElementInstance[]> {
    return this._placeholder$;
  }
  get placeholder(): ElementInstance[] {
    return this._placeholder$.value;
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
      this.element.placeholder.observable$,
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
