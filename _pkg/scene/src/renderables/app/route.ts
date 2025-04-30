import { RouteInstance } from "@elllphnt/elementa-runtime";
import { Scene } from "../../scene/scene";
import { Renderable } from "../_";

export class RouteRenderable extends Renderable {
  readonly route: RouteInstance;

  constructor({ scene, route }: { scene: Scene; route: RouteInstance }) {
    super({ scene });
    this.route = route;

    this.addDisposer(() => {});
  }
}
