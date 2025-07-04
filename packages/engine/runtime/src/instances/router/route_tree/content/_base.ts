import type { RouteTree } from "@elllphnt/elementa-models";
import { ElementaInstanceType, Instance } from "../../../instance.js";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";

export abstract class BaseRouteHandler<V extends string> extends Instance {
  readonly route: RouteTree;
  readonly variant: V;

  constructor({
    environment,
    routeTree,
    parent,
    variant,
  }: {
    environment: ElementRuntimeEnvironment;
    routeTree: RouteTree;
    parent?: Instance;
    variant: V;
  }) {
    super({
      type: ElementaInstanceType.RouteHandler,
      runtime: environment.runtime,
      parent,
    });
    this.route = routeTree;
    this.variant = variant;
  }
}
