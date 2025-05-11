import {
  ElementaViewerComponentState,
  RenderableContent,
} from "@elllphnt/elementa-models";
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

export class ViewerFragmentEnvironment extends DefaultFragmentEnvironment {
  state: ElementaViewerComponentState;

  get styleModifiers() {
    return this.state.renderingContext.styleModifiers;
  }
  get styleModifiers$() {
    return this.state.renderingContext.styleModifiers$;
  }

  constructor({
    runtime,
    state,
  }: {
    runtime: Runtime;
    state: ElementaViewerComponentState;
  }) {
    super({ runtime });
    this.state = state;
  }
}

export class ElementaViewerComponentStateInstance extends ModelInstance<ElementaViewerComponentState> {
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
    model: ElementaViewerComponentState;
  }) {
    super({
      type: ElementaEditorInstanceType.EditorState,
      runtime,
      parent,
      model,
    });

    this.environment = new ViewerFragmentEnvironment({
      runtime,
      state: model,
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
