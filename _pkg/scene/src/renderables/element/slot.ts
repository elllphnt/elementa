import { SlotElementInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import { Scene } from "../../scene/scene";
import { createElementRenderable } from "./_create";
import { ElementRenderable } from "./element";

export class SlotElementRenderable extends ElementRenderable<SlotElementInstance> {
  private _placeholder$ = new BehaviorSubject<ElementRenderable[]>([]);
  private _empty$ = new BehaviorSubject<boolean>(false);

  get placeholder$(): Observable<ElementRenderable[]> {
    return this._placeholder$.asObservable();
  }
  get placeholder(): ElementRenderable[] {
    return this._placeholder$.value;
  }

  get renderables(): ElementRenderable[] {
    return this.placeholder;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.placeholder$;
  }

  get isEmpty$(): Observable<boolean> {
    return this._empty$.asObservable().pipe(distinctUntilChanged());
  }
  get isEmpty(): boolean {
    return this._empty$.value;
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: SlotElementInstance;
  }) {
    super({ scene, instance });

    const placeholderSubscription = this.instance.placeholder$.subscribe(
      (placeholder) => {
        const [newPlaceholder, removed] = reconcileList({
          sources: placeholder,
          targets: this.placeholder,
          sourceRef: (s) => s,
          targetRef: (t) => t.instance,
          create: (instance) => createElementRenderable({ scene, instance }),
        });
        this._placeholder$.next(newPlaceholder);
        removed.forEach((s) => s.dispose());
      }
    );

    this.addDisposer(() => {
      this._placeholder$.complete();
      placeholderSubscription.unsubscribe();
      this.placeholder.forEach((child) => child.dispose());
    });
  }

  setEmpty(empty: boolean) {
    this._empty$.next(empty);
  }
}
