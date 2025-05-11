import { ElementaStage } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { Runtime } from "../../../../runtime/runtime.js";
import { Instance } from "../../../instance.js";
import { ModelInstance } from "../../../model.js";
import { ElementaEditorInstanceType } from "../elementa/_types.js";
import { ElementaFrameInstance } from "./frame.js";

export class ElementaStageInstance extends ModelInstance<ElementaStage> {
  private _frames$ = new BehaviorSubject<ElementaFrameInstance[]>([]);

  get frames() {
    return this._frames$.value;
  }
  get frames$() {
    return this._frames$.asObservable();
  }

  constructor({
    model,
    runtime,
    parent,
  }: {
    runtime: Runtime;
    parent?: Instance;
    model: ElementaStage;
  }) {
    super({
      model,
      runtime,
      type: ElementaEditorInstanceType.EditorState,
      parent,
    });

    const framesSubscription = this.model.frames.observable$.subscribe(
      (frames) => {
        const [nextFrames, removed] = reconcileList({
          sources: frames,
          targets: this.frames,
          sourceRef: (s) => s,
          targetRef: (t) => t.model,
          create: (model) =>
            new ElementaFrameInstance({ model, runtime, parent }),
        });

        this._frames$.next(nextFrames);
        removed.forEach((r) => r.dispose());
      }
    );

    this.addDisposer(() => {
      framesSubscription.unsubscribe();
      this._frames$.next([]);
      this._frames$.complete();
    });
  }
}
