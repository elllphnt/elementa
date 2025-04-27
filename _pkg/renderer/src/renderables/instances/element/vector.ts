import { VectorElementInstance } from "@repo/elementa";
import { of } from "rxjs";
import { ElementaRenderer } from "../../../elementa_renderer";
import { ElementRenderable } from "./element";

export class VectorElementRenderable extends ElementRenderable<VectorElementInstance> {
  get renderables() {
    return [];
  }
  get renderables$() {
    return of([]);
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: VectorElementInstance;
  }) {
    super({ renderer, instance });
  }
}
