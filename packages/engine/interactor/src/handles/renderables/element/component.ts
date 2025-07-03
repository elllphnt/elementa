import type { ComponentElementRenderable } from "@elllphnt/elementa-scene";
import { BehaviorSubject } from "rxjs";
import type { Handle } from "~/handles/handle.js";
import { LayoutUpdatePropagation } from "~/handles/handle_rect.js";
import type { ElementaInteractor } from "~/interactor.js";
import { ComponentHandle } from "../component.js";
import { BaseElementHandle } from "./_base.js";

export class ComponentElementHandle extends BaseElementHandle<ComponentElementRenderable> {
  readonly _component$ = new BehaviorSubject<ComponentHandle | undefined>(
    undefined
  );

  get component$() {
    return this._component$.asObservable();
  }
  get component() {
    return this._component$.value;
  }

  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: ComponentElementRenderable;
    parent: Handle | null;
    interactor: ElementaInteractor;
  }) {
    super({
      renderable,
      interactor,
      parent,
    });

    this.addEventListener("dblclick", () => {
      // const url = this.entity.standardComponentUrl;
      // if (!url) return;
      // this.editor.host.goTo(url);
    });

    // update layout on props change
    const propsSubscription = this.renderable.instance.element.props$.subscribe(
      () => {
        setTimeout(() => {
          this.handleLayoutUpdate({
            propagation: new LayoutUpdatePropagation(),
          });
        });
      }
    );

    const componentSubscription = this.renderable.component$.subscribe(
      (component) => {
        const prev = this.component;
        if (component) {
          this._component$.next(
            new ComponentHandle({
              interactor: this.interactor,
              renderable: component,
              parent: this,
            })
          );
        } else {
          this._component$.next(undefined);
        }

        prev?.dispose();
      }
    );

    this.addDisposer(() => {
      propsSubscription.unsubscribe();
      componentSubscription.unsubscribe();
      this._component$.complete();
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: LayoutUpdatePropagation | undefined;
  }): void {
    super.handleLayoutUpdate({ propagation });
    this.component?.handleLayoutUpdate({ propagation });
  }
}
