import { RouteTree } from "@elllphnt/elementa-models";
import { combineLatest, map, Observable, of, switchMap } from "rxjs";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { Instance } from "../../../instance.js";
import { BaseRouteHandler } from "./_base.js";

export class FunctionRouteHandler extends BaseRouteHandler<"function"> {
  readonly route: RouteTree;

  get handlerModule() {
    return this.route.handlerUrl
      ? this.runtime.moduleManager.module(
          this.route.app.file.project.absoluteFileUrl(this.route.handlerUrl)
        )
      : undefined;
  }
  get handlerModule$() {
    return this.route.handlerUrl$.pipe(
      map((url) => {
        return url
          ? this.runtime.moduleManager.module(
              this.route.app.file.project.absoluteFileUrl(url)
            )
          : undefined;
      })
    );
  }

  get diagnosticLevel(): number {
    const viewsLevel = Math.max(this.handlerModule?.diagnosticLevel ?? 0);

    return Math.max(this.ownDiagnosticLevel, viewsLevel);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.handlerModule$.pipe(
        switchMap((module) => module?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, module]) => Math.max(own, module)));
  }

  constructor({
    environment,
    routeTree,
    parent,
  }: {
    environment: FragmentEnvironment;
    routeTree: RouteTree;
    parent?: Instance;
  }) {
    super({
      variant: "function",
      environment,
      routeTree,
      parent,
    });
    this.route = routeTree;
  }
}
