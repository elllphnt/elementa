import { Fragment } from "@repo/elementa-models";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/_lib/make_element_instance";
import { ElementInstance } from "../elements/element";
import { Instance } from "../instance";
import { FragmentEnvironment } from "./environment";

export class FragmentInstance extends Instance<Fragment> {
  readonly environment: FragmentEnvironment;

  private _content$ = new BehaviorSubject<ElementInstance[]>([]);
  private _recursion$ = new BehaviorSubject<string | undefined>(undefined);

  get content$(): Observable<ElementInstance[]> {
    return this._content$.asObservable();
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get recursion$() {
    return this._recursion$.asObservable();
  }
  get recursion() {
    return this._recursion$.value;
  }

  constructor({
    environment,
    entity,
    parent,
  }: {
    environment: FragmentEnvironment;
    entity: Fragment;
    parent: Instance | null;
  }) {
    super({
      entity,
      elementa: environment.elementa,
      parent,
    });
    this.environment = environment;

    const contentSubscription = combineLatest([
      this.entity.content$,
      this.environment.componentStack$,
    ]).subscribe(([content, componentStack]) => {
      const recursion = this.resolveRecursion(componentStack);
      const newContent = updateInstanceList({
        instances: this.content,
        entities: recursion ? [] : content,
        createInstance: (element) =>
          makeElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      }) as ElementInstance[];

      this._content$.next(newContent);
      this._recursion$.next(recursion);
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }

  private resolveRecursion(componentStack: string[]) {
    const set = new Set<string>();
    for (const component of componentStack) {
      if (set.has(component)) {
        return component;
      }
      set.add(component);
    }

    return undefined;
  }

  protected watchContent(): void {}
}
