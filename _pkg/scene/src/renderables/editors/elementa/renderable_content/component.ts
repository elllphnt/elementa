import { ComponentRenderableContentInstance } from "@elllphnt/elementa-runtime";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../../../../scene/scene.js";
import { ComponentRenderable } from "../../../component/component.js";
import { Renderable } from "../../../renderable.js";

export class ComponentRenderableContentRenderable extends Renderable {
  readonly instance: ComponentRenderableContentInstance;
  private _componentContent$ = new BehaviorSubject<
    ComponentRenderable | undefined
  >(undefined);

  get componentContent() {
    return this._componentContent$.value;
  }

  get componentContent$() {
    return this._componentContent$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ComponentRenderableContentInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const componentSubscription = instance.component$.subscribe((component) => {
      const current = this._componentContent$.value;
      if (component) {
        this._componentContent$.next(
          new ComponentRenderable({
            scene,
            instance: component,
          })
        );
      } else {
        this._componentContent$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      componentSubscription.unsubscribe();
      this._componentContent$.complete();
    });
  }
}
