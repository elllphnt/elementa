import { ContainerElement } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/_lib/make_element_instance";
import { FragmentEnvironment } from "../fragment/environment";
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
    parent: Instance | null;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const contentSubscription = combineLatestOrEmpty([
      this.entity.content$,
      this.entity.contentExpression$,
    ]).subscribe(([_content, contentExpression]) => {
      const content = contentExpression ? [] : _content;
      const newContent = updateInstanceList({
        instances: this.content,
        entities: content,
        createInstance: (element) =>
          makeElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._content$.next(newContent);
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }
}
