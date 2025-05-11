import { ElementaFrame, RenderableContent } from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable } from "rxjs";
import { Runtime } from "../../../../runtime/runtime.js";
import {
  DefaultFragmentEnvironment,
  FragmentEnvironment,
} from "../../../fragment/_.js";
import { Instance } from "../../../instance.js";
import { ModelInstance } from "../../../model.js";
import {
  createRenderableContentInstance,
  RenderableContentInstance,
} from "../elementa/_.js";
import { ElementaEditorInstanceType } from "../elementa/_types.js";

export class FrameFragmentEnvironment extends DefaultFragmentEnvironment {
  frame: ElementaFrame;

  get styleModifiers() {
    return this.frame.renderingContext.styleModifiers;
  }
  get styleModifiers$() {
    return this.frame.renderingContext.styleModifiers$;
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

    const contentSubscription = (
      this.model.content.observable$ as Observable<RenderableContent>
    ).subscribe((content) => {
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
