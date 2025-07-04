import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { ElementaStage } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import type { Runtime } from "~/runtime/runtime.js";
import type { Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { ElementaEditorInstanceType } from "./_types.js";
import { ElementaFrameInstance } from "./frame.js";

export class ElementaStageInstance extends ModelInstance<ElementaStage> {
  private _frames$ = new BehaviorSubject<ElementaFrameInstance[]>([]);

  get frames() {
    return this._frames$.value;
  }
  get frames$() {
    return this._frames$.asObservable();
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      ...this.frames.map((f) => f.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.frames$.pipe(
        switchMap((frames) =>
          combineLatestOrEmpty(frames.map((f) => f.diagnosticLevel$))
        )
      ),
    ]).pipe(map(([own, frameLevels]) => Math.max(own, ...frameLevels)));
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

    const framesSubscription = this.model.frames$.subscribe((frames) => {
      const [nextFrames, removed] = reconcileList({
        sources: frames,
        targets: this.frames,
        sourceRef: (s) => s,
        targetRef: (t) => t.model,
        create: (model) => {
          const frame = new ElementaFrameInstance({ model, runtime, parent });
          this.addLifecycle(frame);
          return frame;
        },
      });

      this._frames$.next(nextFrames);
      removed.forEach((r) => {
        r.dispose();
        this.removeLifecycle(r);
      });
    });

    this.addDisposer(() => {
      framesSubscription.unsubscribe();
      this._frames$.next([]);
      this._frames$.complete();
    });
  }
}
