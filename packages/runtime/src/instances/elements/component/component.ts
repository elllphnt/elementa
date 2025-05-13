import { ComponentElement } from "@elllphnt/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { ComponentInstance } from "../../component/_.js";
import { FragmentEnvironment } from "../../fragment/environment/environment.js";
import { Instance } from "../../instance.js";
import { BaseElementInstance } from "../_base.js";
import { ComponentElementComponentPropResolver } from "./component_prop_resolver.js";

export class ComponentElementInstance<
  E extends ComponentElement = ComponentElement
> extends BaseElementInstance<E> {
  readonly componentPropsResolver: ComponentElementComponentPropResolver;
  private _component$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );

  get component$() {
    return this._component$.asObservable();
  }
  get component() {
    return this._component$.value;
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
    environment: FragmentEnvironment;
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

    this.addDisposer(() => {
      componentSubscription.unsubscribe();
    });
  }
}
