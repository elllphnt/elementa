import { ElementaEditorComponentStateInstance } from "@elllphnt/elementa-runtime";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { Scene } from "../../../scene/scene.js";
import { Renderable } from "../../renderable.js";
import { ElementaFrameRenderable } from "./frame.js";

export class ElementaEditorComponentStateRenderable extends Renderable {
  readonly instance: ElementaEditorComponentStateInstance;
  private _frames$ = new BehaviorSubject<ElementaFrameRenderable[]>([]);

  get frames() {
    return this._frames$.value;
  }

  get frames$() {
    return this._frames$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ElementaEditorComponentStateInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const framesSubscription = this.instance.frames$.subscribe((frames) => {
      const [nextFrames, removed] = reconcileList({
        sources: frames,
        targets: this.frames,
        sourceRef: (s) => s,
        targetRef: (t) => t.instance,
        create: (instance) =>
          new ElementaFrameRenderable({
            scene,
            instance,
          }),
      });

      this._frames$.next(nextFrames);
      removed.forEach((frame) => frame.dispose());
    });

    this.addDisposer(() => {
      framesSubscription.unsubscribe();
      this._frames$.complete();
    });
  }
}
