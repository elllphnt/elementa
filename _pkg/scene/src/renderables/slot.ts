import { SlotInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../scene/scene";
import { createElementRenderable } from "./element/_create";
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

  constructor({ scene, instance }: { scene: Scene; instance: SlotInstance }) {
    super({ instance, scene });

    const contentSubscription = this.instance.content$.subscribe((content) => {
      const [newContent, removed] = reconcileList({
        sources: content,
        targets: this.content,
        sourceRef: (s) => s,
        targetRef: (t) => t.instance,
        create: (instance) => createElementRenderable({ scene, instance }),
      });
      this._content$.next(newContent);
      removed.forEach((s) => s.dispose());
    });

    this.addDisposer(() => {
      this._content$.complete();
      contentSubscription.unsubscribe();
      this.content.forEach((child) => child.dispose);
    });
  }
}
