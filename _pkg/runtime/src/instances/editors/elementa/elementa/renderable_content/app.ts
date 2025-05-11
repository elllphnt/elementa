import { AppRenderableContent } from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { AppInputResolver, AppInstance } from "../../../../app/_.js";
import { FragmentEnvironment } from "../../../../fragment/_.js";
import { ModelInstance } from "../../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class AppRenderableContentInputResolver extends AppInputResolver {
  renderableContent: AppRenderableContent;

  constructor({
    environment,
    renderableContent,
  }: {
    environment: FragmentEnvironment;
    renderableContent: AppRenderableContent;
  }) {
    super({ environment });
    this.renderableContent = renderableContent;
  }

  variableValue(name: string): unknown {
    return this.renderableContent.variableValue(name);
  }
  variableValue$(name: string): Observable<unknown> {
    return this.renderableContent.variableValue$(name);
  }
}

export class AppRenderableContentInstance extends ModelInstance<AppRenderableContent> {
  private _app$ = new BehaviorSubject<AppInstance | undefined>(undefined);

  app$ = this._app$.asObservable();
  get app(): AppInstance | undefined {
    return this._app$.getValue();
  }

  constructor({
    model,
    environment,
  }: {
    model: AppRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      type: ElementaEditorInstanceType.RenderableContext,
      model,
      runtime: environment.runtime,
    });

    const appSubscription = this.model.app$
      .pipe(switchMap((f) => f?.model$ ?? of(undefined)))
      .subscribe((app) => {
        const current = this.app;
        if (app) {
          this._app$.next(
            new AppInstance({
              app,
              inputResolver: new AppRenderableContentInputResolver({
                environment,
                renderableContent: this.model,
              }),
              parent: this,
            })
          );
        } else {
          this._app$.next(undefined);
        }

        if (current) {
          current.dispose();
        }
      });

    this.addDisposer(() => {
      this._app$.complete();
      appSubscription.unsubscribe();
    });
  }
}
