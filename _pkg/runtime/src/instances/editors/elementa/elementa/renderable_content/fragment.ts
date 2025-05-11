import { FragmentRenderableContent } from "@elllphnt/elementa-models";
import { BehaviorSubject, of, switchMap } from "rxjs";
import {
  FragmentEnvironment,
  FragmentInstance,
} from "../../../../fragment/_.js";
import { ModelInstance } from "../../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class FragmentRenderableContentInstance extends ModelInstance<FragmentRenderableContent> {
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

    const fragmentSubscription = this.model.fragment$
      .pipe(switchMap((f) => f?.model$ ?? of(undefined)))
      .subscribe((fragment) => {
        const current = this.fragment;
        if (fragment) {
          this._fragment$.next(
            new FragmentInstance({
              fragment,
              environment,
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
