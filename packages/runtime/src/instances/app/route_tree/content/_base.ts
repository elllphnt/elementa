import { RouteTree } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { ElementaInstanceType, Instance } from "../../../instance.js";

export abstract class BaseRouteHandler<V extends string> extends Instance {
  readonly route: RouteTree;
  readonly variant: V;

  constructor({
    environment,
    routeTree,
    parent,
    variant,
  }: {
    environment: FragmentEnvironment;
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
