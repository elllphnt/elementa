import { ComponentElement } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/_lib/make_element_instance";
import { FragmentEnvironment } from "../../fragment/environment";
import { Instance } from "../../instance";
import { ElementInstance } from "../element";

export abstract class ComponentElementInstance<
  E extends ComponentElement = ComponentElement,
> extends ElementInstance<E> {
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  abstract get isContainer(): boolean;
  abstract get isContainer$(): Observable<boolean>;

  abstract get isUnwrappable(): boolean;
  abstract get isUnwrappable$(): Observable<boolean>;

  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
    environment: FragmentEnvironment;
    parent: Instance | null;
  }) {
    super({
      element,
      environment,
      parent,
    });

    this.addDisposer(() => {
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }

  watchContent() {
    const contentSubscription = combineLatestOrEmpty([
      this.entity.content$,
      this.entity.contentExpression$,
      this.isContainer$,
    ]).subscribe(([_content, contentExpression, isContainer]) => {
      let content = isContainer ? (contentExpression ? [] : _content) : [];

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
    });
  }
}
