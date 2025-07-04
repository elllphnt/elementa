import type { ElementaPreviewInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject } from "rxjs";
import type { Scene } from "../../../scene/scene.js";
import { Renderable } from "../../renderable.js";
import type {
  RenderableContentRenderable} from "../renderable_content/_create.js";
import {
  createRenderableContentRenderable,
} from "../renderable_content/_create.js";

export class ElementaPreviewRenderable extends Renderable {
  readonly instance: ElementaPreviewInstance;
  private _content$ = new BehaviorSubject<
    RenderableContentRenderable | undefined
  >(undefined);

  get content() {
    return this._content$.value;
  }

  get content$() {
    return this._content$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ElementaPreviewInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const contentSubscription = this.instance.content$.subscribe((content) => {
      const current = this._content$.value;
      if (content) {
        this._content$.next(
          createRenderableContentRenderable({
            scene,
            instance: content,
          })
        );
      } else {
        this._content$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this._content$.complete();
    });
  }
}
