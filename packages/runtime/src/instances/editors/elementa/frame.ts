import { ElementaFrame } from "@elllphnt/elementa-core";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { Runtime } from "../../../runtime/runtime.js";
import {
  DefaultFragmentEnvironment,
  FragmentEnvironment,
} from "../../fragment/_.js";
import { Instance } from "../../instance.js";
import { ModelInstance } from "../../model.js";
import { ElementaEditorInstanceType } from "./_types.js";
import {
  createRenderableContentInstance,
  RenderableContentInstance,
} from "./renderable_content/_.js";

export class FrameFragmentEnvironment extends DefaultFragmentEnvironment {
  frame: ElementaFrame;

  get styleModifiers() {
    return this.frame.context.styleModifiers;
  }
  get styleModifiers$() {
    return this.frame.context.styleModifiers$;
  }

  constructor({ runtime, frame }: { runtime: Runtime; frame: ElementaFrame }) {
    super({ runtime });
    this.frame = frame;
  }
}

export class ElementaFrameInstance extends ModelInstance<ElementaFrame> {
  environment: FragmentEnvironment;
  private _content$ = new BehaviorSubject<
    RenderableContentInstance | undefined
  >(undefined);

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.content?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.content$.pipe(
        switchMap((content) => content?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, content]) => Math.max(own, content)));
  }

  constructor({
    runtime,
    parent,
    model,
  }: {
    runtime: Runtime;
    parent?: Instance;
    model: ElementaFrame;
  }) {
    super({
      type: ElementaEditorInstanceType.Frame,
      runtime,
      parent,
      model,
    });

    this.environment = new FrameFragmentEnvironment({
      runtime,
      frame: model,
    });

    const contentSubscription = this.model.content$.subscribe((content) => {
      const current = this.content;
      if (content) {
        const next = createRenderableContentInstance({
          model: content,
          environment: this.environment,
        }) as RenderableContentInstance;
        this._content$.next(next);
      } else {
        this._content$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });
    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this._content$.complete();
    });
  }
}
