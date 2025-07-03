import { Lifecycle, reconcileList } from "@elllphnt/elementa-kernel";
import type { ElementaStageRenderable } from "@elllphnt/elementa-scene";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from "rxjs";
import { FallbackHandle } from "./handles/fallback.js";
import type { Handle } from "./handles/handle.js";
import { FrameHandle } from "./handles/renderables/frame.js";
import { Interface } from "./interface.js";
import { InteractionManager } from "./managers/interaction.js";
import { MarkerManager } from "./markers/manager.js";
import { ToolManager } from "./tools/tools/manager.js";

export class ElementaInteractor extends Lifecycle {
  readonly stage: ElementaStageRenderable;
  readonly interface: Interface = new Interface({ interactor: this });
  readonly interactionManager = new InteractionManager();
  readonly toolManager = new ToolManager();
  readonly markerManager = new MarkerManager();
  readonly fallback: FallbackHandle;

  private _handles = new Map<string, Handle>();

  private _flags$ = new BehaviorSubject<Record<string, boolean>>({});
  private _frames$ = new BehaviorSubject<FrameHandle[]>([]);

  flags$ = this._flags$.asObservable();
  get flags() {
    return this._flags$.value;
  }

  flag(key: string) {
    return this._flags$.value[key] ?? false;
  }
  flag$(key: string) {
    return this._flags$.pipe(
      map((flags) => flags[key] ?? false),
      distinctUntilChanged()
    );
  }

  get handles() {
    return [...this._handles.values()];
  }
  handle(handleId: string) {
    return this._handles.get(handleId);
  }

  frames$ = this._frames$.asObservable();
  get frames() {
    return this._frames$.value;
  }

  constructor({ stage }: { stage: ElementaStageRenderable }) {
    super();
    this.stage = stage;

    this.fallback = new FallbackHandle({ interactor: this, parent: null });

    const framesSubscription = combineLatest({
      ready: this.stage.ready$,
      frames: this.stage.frames$,
    }).subscribe(({ ready, frames }) => {
      const [nextFrames, removed] = reconcileList({
        sources: ready ? frames : [],
        targets: this.frames,
        sourceRef: (f) => f,
        targetRef: (f) => f.renderable,
        create: (frame) =>
          new FrameHandle({
            renderable: frame,
            interactor: this,
            parent: null,
          }),
      });

      this._frames$.next(nextFrames);
      removed.forEach((handle) => handle.dispose());
    });

    this.addDisposer(() => {
      framesSubscription.unsubscribe();
    });
  }

  registerHandle(handle: Handle): void {
    this._handles.set(handle.id, handle);
  }
  unregisterHandle(handle: Handle): void {
    this._handles.delete(handle.id);
  }

  setFlag(key: string, value: boolean) {
    this._flags$.next({ ...this._flags$.value, [key]: value });
  }
}
