import { reconcileList } from "@elllphnt/elementa-kernel";
import type { ComponentInstance } from "@elllphnt/elementa-runtime";
import type { Observable } from "rxjs";
import { BehaviorSubject, of } from "rxjs";
import type { Scene } from "../../scene/scene.js";
import { createElementRenderable } from "../element/_create.js";
import type { ElementRenderable } from "../element/element.js";
import { FragmentRenderable } from "../fragment.js";
import { InstanceRenderable } from "../instance.js";
import type { Renderable } from "../renderable.js";

export class ComponentRenderable extends InstanceRenderable<ComponentInstance> {
  private _content$ = new BehaviorSubject<ElementRenderable[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentRenderable[]>([]);

  get content$(): Observable<ElementRenderable[]> {
    return this._content$.asObservable();
  }
  get content(): ElementRenderable[] {
    return this._content$.value;
  }

  get fragments(): FragmentRenderable[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentRenderable[]> {
    return this._fragments$.asObservable();
  }

  get renderables(): Renderable[] {
    return [];
  }
  get renderables$(): Observable<Renderable[]> {
    return of([]);
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ComponentInstance;
  }) {
    super({ scene, instance });

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

    const fragmentsSubscription = this.instance.fragments$.subscribe(
      (fragments) => {
        const newFragments = fragments.map(
          (fragment) =>
            new FragmentRenderable({
              scene: this.scene,
              instance: fragment,
            })
        );
        this._fragments$.next(newFragments);
      }
    );

    this.scene.registerComponent(this.instance.model);

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      fragmentsSubscription.unsubscribe();
      this.scene.unregisterComponent(this.instance.model);
    });
  }
}
