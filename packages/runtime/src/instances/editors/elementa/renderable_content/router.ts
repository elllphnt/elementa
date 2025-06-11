import { RouterRenderableContent } from "@elllphnt/elementa-core";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { RouterInstance } from "../../../router/_.js";
import { BaseRenderableContentInstance } from "./_base.js";

export class RouterRenderableContentInstance extends BaseRenderableContentInstance<RouterRenderableContent> {
  private _app$ = new BehaviorSubject<RouterInstance | undefined>(undefined);

  app$ = this._app$.asObservable();
  get app(): RouterInstance | undefined {
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
    model: RouterRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      model,
      environment,
    });

    const appSubscription = this.model.router$
      .pipe(switchMap((f) => f?.model$ ?? of(undefined)))
      .subscribe((model) => {
        const current = this.app;
        if (model) {
          this._app$.next(
            new RouterInstance({
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
