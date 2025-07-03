import { reconcileList } from "@elllphnt/elementa-kernel";
import type { FragmentRenderable } from "@elllphnt/elementa-scene";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import { createElementHandle, type ElementHandle } from "./element/element.js";
import { RenderableHandle } from "./renderable.js";

export class FragmentHandle extends RenderableHandle<FragmentRenderable> {
  private _content$ = new BehaviorSubject<ElementHandle[]>([]);

  get content(): ElementHandle[] {
    return this._content$.value;
  }
  get content$(): Observable<ElementHandle[]> {
    return this._content$.asObservable();
  }

  constructor({
    interactor,
    renderable,
    parent,
  }: {
    interactor: ElementaInteractor;
    renderable: FragmentRenderable;
    parent: Handle | null;
  }) {
    super({
      id: [parent?.id, renderable.instance.model.id].filter(Boolean).join("."),
      renderable,
      interactor,
      parent,
    });

    const contentSubscription = this.renderable.content$.subscribe(
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

        this._content$.next(nextContent);
        removed.forEach((handle) => {
          handle.dispose();
        });
      }
    );

    this.addDisposer(() => {
      this._content$.complete();
      contentSubscription.unsubscribe();
      this.content.forEach((child) => child.dispose());
    });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
