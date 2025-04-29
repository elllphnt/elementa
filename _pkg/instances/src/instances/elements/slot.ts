import { SlotElement } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/instances/elements/_create";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";

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
    parent: Instance | null;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const contentSubscription = combineLatestOrEmpty([
      this.entity.placeholder$,
    ]).subscribe(([placeholder]) => {
      const newContent = updateInstanceList({
        instances: this.placeholder,
        entities: placeholder,
        createInstance: (element) =>
          makeElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._placeholder$.next(newContent);
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.placeholder.forEach((instance) => instance.dispose());
      this._placeholder$.next([]);
      this._placeholder$.complete();
    });
  }
}
