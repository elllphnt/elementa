import { ContainerElement } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { makeElementInstance } from "~/src/instances/elements/_create";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";

export class ContainerElementInstance extends ElementInstance<ContainerElement> {
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
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

    const contentSubscription = this.element.content.observable$.subscribe(
      (content) => {
        const [newContent, removed] = reconcileList({
          targets: this.content,
          sources: content,
          sourceRef: (c) => c,
          targetRef: (c) => c.element,
          create: (content) => {
            const instance = makeElementInstance({
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
      }
    );

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }
}
