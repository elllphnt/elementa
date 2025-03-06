import { SlotInstance } from "@repo/elementa";
import { BehaviorSubject } from "rxjs";
import { updateInstanceRenderableList } from "~/src/_lib/renderables";
import { ElementaRenderer } from "~/src/elementa_renderer";
import { ElementRenderable } from "./element/element";
import { InstanceRenderable } from "./instance";

export class SlotRenderable extends InstanceRenderable<SlotInstance> {
  private _content$ = new BehaviorSubject<ElementRenderable[]>([]);

  get content$() {
    return this._content$;
  }
  get content() {
    return this._content$.value;
  }

  get renderables() {
    return this.content;
  }
  get renderables$() {
    return this.content$;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: SlotInstance;
  }) {
    super({ instance, renderer });

    const contentSubscription = this.instance.content$.subscribe((content) => {
      const newContent = updateInstanceRenderableList({
        renderables: this.content,
        instances: content,
        renderer: this.renderer,
      });

      this._content$.next(newContent);
    });

    this.addDisposer(() => {
      this._content$.complete();
      contentSubscription.unsubscribe();
      this.content.forEach((child) => child.dispose);
    });
  }
}
