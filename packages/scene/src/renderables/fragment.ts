import { FragmentInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { Scene } from "../scene/scene.js";
import { ElementRenderable } from "./element/_.js";
import { createElementRenderable } from "./element/_create.js";
import { InstanceRenderable } from "./instance.js";
import { SlotRenderable } from "./slot.js";

export class FragmentRenderable extends InstanceRenderable<FragmentInstance> {
  private _content$ = new BehaviorSubject<ElementRenderable[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentRenderable[]>([]);
  private _slots$ = new BehaviorSubject<SlotRenderable[]>([]);

  get content$(): Observable<ElementRenderable[]> {
    return this._content$.asObservable();
  }
  get content(): ElementRenderable[] {
    return this._content$.value;
  }

  get fragments$() {
    return this._fragments$.asObservable();
  }
  get fragments() {
    return this._fragments$.value;
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

    const fragmentSubscription = this.instance.environment.fragments$.subscribe(
      (fragments) => {
        const [newFragments, removed] = reconcileList({
          sources: fragments,
          targets: this.fragments,
          sourceRef: (s) => s,
          targetRef: (t) => t.instance,
          create: (instance) => new FragmentRenderable({ scene, instance }),
        });
        this._fragments$.next(newFragments);
        removed.forEach((s) => s.dispose());
      }
    );

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      fragmentSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this.fragments.forEach((instance) => instance.dispose());
      this._fragments$.next([]);
      this._fragments$.complete();
    });
  }
}
