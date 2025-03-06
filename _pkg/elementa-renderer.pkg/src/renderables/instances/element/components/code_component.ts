import { CodeComponentElementInstance } from "@repo/elementa";
import { of } from "rxjs";
import { ElementaRenderer } from "../../../../elementa_renderer";
import { ComponentElementRenderable } from "./component";

export class CodeComponentElementRenderable extends ComponentElementRenderable<CodeComponentElementInstance> {
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
    instance: CodeComponentElementInstance;
  }) {
    super({ instance, renderer });
  }
}
