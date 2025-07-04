import type { RouterRenderableContent } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import { RouterInstance } from "~/instances/router/router.js";
import { BaseRenderableContentInstance } from "./_base.js";

export class RouterRenderableContentInstance extends BaseRenderableContentInstance<RouterRenderableContent> {
  private _router$ = new BehaviorSubject<RouterInstance | undefined>(undefined);

  router$ = this._router$.asObservable();
  get router(): RouterInstance | undefined {
    return this._router$.getValue();
  }

  get diagnosticLevel(): number {
    return Math.max(this.ownDiagnosticLevel, this.router?.diagnosticLevel ?? 0);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.router$.pipe(
        switchMap((router) => router?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, router]) => Math.max(own, router)));
  }

  constructor({
    model,
    environment,
  }: {
    model: RouterRenderableContent;
    environment: ElementRuntimeEnvironment;
  }) {
    super({
      model,
      environment,
    });

    const routerSubscription = this.model.router$
      .pipe(switchMap((f) => f?.model$ ?? of(undefined)))
      .subscribe((model) => {
        const current = this.router;
        if (model) {
          const instance = new RouterInstance({
            model,
            environment,
            parent: this,
          });
          this.addLifecycle(instance);
          this._router$.next(instance);
        } else {
          this._router$.next(undefined);
        }

        if (current) {
          this.removeLifecycle(current);
          current.dispose();
        }
      });

    this.addDisposer(() => {
      if (this.router) {
        this.removeLifecycle(this.router);
        this.router.dispose();
      }
      this._router$.complete();
      routerSubscription.unsubscribe();
    });
  }
}
