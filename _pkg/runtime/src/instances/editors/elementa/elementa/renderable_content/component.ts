import { ComponentRenderableContent } from "@elllphnt/elementa-models";
import { BehaviorSubject, of, switchMap } from "rxjs";
import {
  ComponentInputResolver,
  ComponentInstance,
} from "../../../../component/_.js";
import { FragmentEnvironment } from "../../../../fragment/_.js";
import { ModelInstance } from "../../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class ComponentRenderableContentInstance extends ModelInstance<ComponentRenderableContent> {
  propResolver: ComponentInputResolver;

  private _component$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );

  component$ = this._component$.asObservable();
  get component(): ComponentInstance | undefined {
    return this._component$.getValue();
  }

  constructor({
    model,
    environment,
  }: {
    model: ComponentRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      type: ElementaEditorInstanceType.RenderableContext,
      model,
      runtime: environment.runtime,
    });

    const componentSubscription = this.model.component$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((component) => {
        const current = this.component;
        if (component) {
          this._component$.next(
            new ComponentInstance({
              component,
              propResolver: this.propResolver,
              parent: this,
            })
          );
        } else {
          this._component$.next(undefined);
        }

        if (current) {
          current.dispose();
        }
      });

    this.addDisposer(() => {
      this._component$.complete();
      componentSubscription.unsubscribe();
    });
  }
}
