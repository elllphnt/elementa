import { ComponentElement } from "@elllphnt/elementa-models";
import { BehaviorSubject, of, switchMap } from "rxjs";
import { ComponentInstance } from "../../component/_.js";
import { FragmentEnvironment } from "../../fragment/environment/environment.js";
import { Instance } from "../../instance.js";
import { ElementInstance } from "../element.js";
import { ComponentElementComponentPropResolver } from "./component_prop_resolver.js";

export class ComponentElementInstance<
  E extends ComponentElement = ComponentElement
> extends ElementInstance<E> {
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

    const componentSubscription = this.element.localComponent$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((component) => {
        if (component) {
          const currentComponent = this.component;
          const componentInstance = new ComponentInstance({
            component,
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
