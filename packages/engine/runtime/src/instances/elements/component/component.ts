import { ComponentElement } from "@elllphnt/elementa-core";
import { reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { ComponentInstance } from "../../component/_.js";
import { Instance } from "../../instance.js";
import { BaseElementInstance } from "../_base.js";
import { createElementInstance, ElementInstance } from "../_element.js";
import { ElementRuntimeEnvironment } from "../_environment/environment.js";
import { ComponentElementComponentPropResolver } from "./component_prop_resolver.js";

export class ComponentElementInstance<
  E extends ComponentElement = ComponentElement
> extends BaseElementInstance<E> {
  readonly componentPropsResolver: ComponentElementComponentPropResolver;
  private _component$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get component$() {
    return this._component$.asObservable();
  }
  get component() {
    return this._component$.value;
  }

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(
      super.diagnosticLevel,
      this.component?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      super.diagnosticLevel$,
      this.component$.pipe(
        switchMap((component) => component?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, component]) => Math.max(own, component)));
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: E;
    environment: ElementRuntimeEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });

    this.componentPropsResolver = new ComponentElementComponentPropResolver(
      this
    );

    const componentSubscription = this.element.component$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((component) => {
        if (component) {
          const currentComponent = this.component;
          const componentInstance = new ComponentInstance({
            model: component,
            inputResolver: this.componentPropsResolver,
          });
          this._component$.next(componentInstance);
          if (currentComponent) {
            currentComponent.dispose();
          }
        } else {
          this._component$.next(undefined);
        }
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
      componentSubscription.unsubscribe();
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }
}
