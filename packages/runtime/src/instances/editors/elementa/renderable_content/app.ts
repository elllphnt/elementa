import { AppRenderableContent } from "@elllphnt/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { AppInstance } from "../../../app/_.js";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { BaseRenderableContentInstance } from "./_base.js";

export class AppRenderableContentInstance extends BaseRenderableContentInstance<AppRenderableContent> {
  private _app$ = new BehaviorSubject<AppInstance | undefined>(undefined);

  app$ = this._app$.asObservable();
  get app(): AppInstance | undefined {
    return this._app$.getValue();
  }

  get diagnosticLevel(): number {
    return Math.max(this.ownDiagnosticLevel, this.app?.diagnosticLevel ?? 0);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.app$.pipe(switchMap((app) => app?.diagnosticLevel$ ?? of(0))),
    ]).pipe(map(([own, app]) => Math.max(own, app)));
  }

  constructor({
    model,
    environment,
  }: {
    model: AppRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      model,
      environment,
    });

    const appSubscription = this.model.app$
      .pipe(switchMap((f) => f?.model$ ?? of(undefined)))
      .subscribe((model) => {
        const current = this.app;
        if (model) {
          this._app$.next(
            new AppInstance({
              model,
              environment,
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
