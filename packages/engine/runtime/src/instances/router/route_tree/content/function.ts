import type { RouteTree } from "@elllphnt/elementa-models";
import type { Observable} from "rxjs";
import { combineLatest, map, of, switchMap } from "rxjs";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import type { Instance } from "../../../instance.js";
import { BaseRouteHandler } from "./_base.js";

export class FunctionRouteHandler extends BaseRouteHandler<"function"> {
  readonly route: RouteTree;

  get handlerModule() {
    return this.route.handlerUrl
      ? this.runtime.moduleManager.module(
          this.route.project.absoluteFileUrl(this.route.handlerUrl)
        )
      : undefined;
  }
  get handlerModule$() {
    return this.route.handlerUrl$.pipe(
      map((url) => {
        return url
          ? this.runtime.moduleManager.module(
              this.route.project.absoluteFileUrl(url)
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
    environment: ElementRuntimeEnvironment;
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
