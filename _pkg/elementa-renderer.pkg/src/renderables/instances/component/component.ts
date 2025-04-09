import { ComponentInstance } from "@repo/elementa";
import { ElementaRenderer } from "~/src/elementa_renderer";
import { FragmentRenderable, Renderable } from "../_";

export class ComponentRenderable extends Renderable {
  readonly instance: ComponentInstance;
  readonly template: FragmentRenderable;

  get renderables() {
    return this.template.renderables;
  }
  get renderables$() {
    return this.template.renderables$;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: ComponentInstance;
  }) {
    super({ renderer });
    this.instance = instance;
    this.template = new FragmentRenderable({
      renderer: this.renderer,
      instance: this.instance.template,
    });
  }
}
