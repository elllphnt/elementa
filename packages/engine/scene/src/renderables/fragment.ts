import { reconcileList } from "@elllphnt/elementa-kernel";
import type { FragmentInstance } from "@elllphnt/elementa-runtime";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import type { Scene } from "../scene/scene.js";
import { createElementRenderable } from "./element/_create.js";
import type { ElementRenderable } from "./element/element.js";
import { InstanceRenderable } from "./instance.js";
import type { SlotRenderable } from "./slot_fill.js";

export class FragmentRenderable extends InstanceRenderable<FragmentInstance> {
  private _content$ = new BehaviorSubject<ElementRenderable[]>([]);
  private _slots$ = new BehaviorSubject<SlotRenderable[]>([]);

  get content$(): Observable<ElementRenderable[]> {
    return this._content$.asObservable();
  }
  get content(): ElementRenderable[] {
    return this._content$.value;
  }

  get renderables(): ElementRenderable[] {
    return this.content;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.content$;
  }

  get slots$() {
    return this._slots$.asObservable();
  }
  get slots() {
    return this._slots$.value;
  }

  constructor({
    instance,
    scene,
  }: {
    instance: FragmentInstance;
    scene: Scene;
  }) {
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

    this.scene.registerFragment(this.instance.model);

    this.addDisposer(() => {
      contentSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this.scene.unregisterFragment(this.instance.model);
    });
  }
}
