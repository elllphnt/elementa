import { ElementaPreview } from "@elllphnt/elementa-core";
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

export class ElementaPreviewFragmentEnvironment extends DefaultFragmentEnvironment {
  preview: ElementaPreview;

  get styleModifiers() {
    return this.preview.context.styleModifiers;
  }
  get styleModifiers$() {
    return this.preview.context.styleModifiers$;
  }

  constructor({
    runtime,
    preview,
  }: {
    runtime: Runtime;
    preview: ElementaPreview;
  }) {
    super({ runtime });
    this.preview = preview;
  }
}

export class ElementaViewerComponentStateInstance extends ModelInstance<ElementaPreview> {
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
    model: ElementaPreview;
  }) {
    super({
      type: ElementaEditorInstanceType.EditorState,
      runtime,
      parent,
      model,
    });

    this.environment = new ElementaPreviewFragmentEnvironment({
      runtime,
      preview: model,
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
