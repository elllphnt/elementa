import { ComponentElement } from "@elllphnt/elementa-models";
import { BehaviorSubject } from "rxjs";
import { ComponentInstance } from "../../_";
import { FragmentEnvironment } from "../../fragment/environment/environment";
import { Instance } from "../../instance";
import { ElementInstance } from "../element";
import { ComponentElementComponentPropResolver } from "./component_prop_resolver";

export class ComponentElementInstance<
  E extends ComponentElement = ComponentElement
> extends ElementInstance<E> {
  readonly componentPropsResolver: ComponentElementComponentPropResolver;
  private _component$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );

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

    this.componentPropsResolver = new ComponentElementComponentPropResolver(
      this
    );

    const componentSubscription = this.element.localComponent$.subscribe(
      (component) => {
        if (component) {
          const componentInstance = new ComponentInstance({
            component,
            propResolver: this.componentPropsResolver,
          });
          this._component$.next(componentInstance);
        } else {
          this._component$.next(undefined);
        }
      }
    );

    this.addDisposer(() => {
      componentSubscription.unsubscribe();
    });
  }
}
