import { Fragment } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { makeElementInstance } from "~/src/instances/elements/_create";
import { ElementInstance } from "../elements/element";
import { Instance } from "../instance";
import { FragmentEnvironment } from "./environment/environment";

export class FragmentInstance extends Instance {
  readonly fragment: Fragment;
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
    fragment,
    environment,
  }: {
    fragment: Fragment;
    environment: FragmentEnvironment;
  }) {
    super(environment.elementa);
    this.fragment = fragment;
    this.environment = environment;

    const contentSubscription = combineLatest([
      this.fragment.content.observable$,
      this.environment.componentStack$,
    ]).subscribe(([content, componentStack]) => {
      const recursion = this.resolveRecursion(componentStack);
      const newContent = reconcileList({
        sources: recursion ? [] : content,
        targets: this.content,
        sourceRef: (e) => e,
        targetRef: (i) => i.element,
        create: (element) =>
          makeElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
        dispose: (i) => i.dispose(),
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
}
