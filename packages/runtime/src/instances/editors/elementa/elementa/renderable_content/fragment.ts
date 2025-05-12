import { FragmentRenderableContent } from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable } from "rxjs";
import {
  FragmentEnvironment,
  FragmentInstance,
} from "../../../../fragment/_.js";
import { ChildFragmentEnvironment } from "../../../../fragment/environment/child_environment.js";
import { ModelInstance } from "../../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class FragmentRenderableContentFragmentEnvironment extends ChildFragmentEnvironment {
  renderableContent: FragmentRenderableContent;

  constructor({
    environment,
    renderableContent,
  }: {
    environment: FragmentEnvironment;
    renderableContent: FragmentRenderableContent;
  }) {
    super({ parent: environment });
    this.renderableContent = renderableContent;
  }

  paramValue(name: string): unknown {
    return this.renderableContent.paramValue(name);
  }

  paramValue$(name: string): Observable<unknown> {
    return this.renderableContent.paramValue$(name);
  }
}

export class FragmentRenderableContentInstance extends ModelInstance<FragmentRenderableContent> {
  environment: FragmentEnvironment;

  private _fragment$ = new BehaviorSubject<FragmentInstance | undefined>(
    undefined
  );

  fragment$ = this._fragment$.asObservable();
  get fragment(): FragmentInstance | undefined {
    return this._fragment$.getValue();
  }

  constructor({
    model,
    environment,
  }: {
    model: FragmentRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      type: ElementaEditorInstanceType.RenderableContext,
      model,
      runtime: environment.runtime,
    });

    this.environment = new FragmentRenderableContentFragmentEnvironment({
      environment,
      renderableContent: this.model,
    });

    const fragmentSubscription = this.model.fragment$.subscribe((fragment) => {
      const current = this.fragment;
      if (fragment) {
        this._fragment$.next(
          new FragmentInstance({
            model: fragment,
            environment: this.environment,
            parent: this,
          })
        );
      } else {
        this._fragment$.next(undefined);
      }

      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      this._fragment$.complete();
      fragmentSubscription.unsubscribe();
    });
  }
}
