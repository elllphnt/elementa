import { reconcileList } from "@elllphnt/elementa-kernel";
import type { SlotElementRenderable } from "@elllphnt/elementa-scene";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { BaseElementHandle } from "./_base.js";
import type { ElementHandle } from "./element.js";
import { createElementHandle } from "./element.js";

export class SlotElementHandle extends BaseElementHandle<SlotElementRenderable> {
  private _children$ = new BehaviorSubject<ElementHandle[]>([]);

  get content(): ElementHandle[] {
    return this._children$.value;
  }
  get content$(): Observable<ElementHandle[]> {
    return this._children$.asObservable();
  }

  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: SlotElementRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({
      renderable,
      interactor,
      parent,
    });

    const childrenSubscription = this.renderable.placeholder$.subscribe(
      (children) => {
        const [nextContent, removed] = reconcileList({
          sources: children,
          targets: this.content,
          sourceRef: (e) => e,
          targetRef: (e) => e.renderable,
          create: (renderable) =>
            createElementHandle({
              renderable,
              parent: this,
              interactor: this.interactor,
            }),
        });

        this._children$.next(nextContent);
        removed.forEach((handle) => {
          handle.dispose();
        });
      }
    );

    this.addDisposer(() => {
      this._children$.complete();
      childrenSubscription.unsubscribe();
      this.content.forEach((child) => child.dispose());
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: any | undefined;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.content.forEach((child) => child.handleLayoutUpdate({ propagation }));
  }
}
