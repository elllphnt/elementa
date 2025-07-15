import type { ComponentRenderable } from "@elllphnt/elementa-scene";
import { BehaviorSubject } from "rxjs";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import type { LayoutUpdatePropagation } from "../handle_rect.js";
import { type ElementHandle } from "./element/element.js";
import { RenderableHandle } from "./renderable.js";

export class ComponentHandle extends RenderableHandle<ComponentRenderable> {
  private _template$ = new BehaviorSubject<ElementHandle | undefined>(
    undefined
  );

  get template$() {
    return this._template$.asObservable();
  }
  get template() {
    return this._template$.value;
  }

  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: ComponentRenderable;
    parent: Handle | null;
  }) {
    super({
      id: [parent?.id, renderable.instance.model.url].filter(Boolean).join("."),
      renderable,
      interactor,
      parent,
    });

    // const templateSubscription = this.renderable.template$.subscribe(
    //   (template) => {
    //     const prev = this.template;
    //     if (template) {
    //       this._template$.next(
    //         createElementHandle({
    //           interactor: this.interactor,
    //           renderable: template,
    //           parent: this,
    //         })
    //       );
    //     } else {
    //       this._template$.next(undefined);
    //     }
    //     prev?.dispose();
    //   }
    // );

    this.addDisposer(() => {
      // templateSubscription.unsubscribe();
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: LayoutUpdatePropagation;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.template?.handleLayoutUpdate({ propagation });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
