import { ElementInstance } from "@repo/elementa";
import { of } from "rxjs";
import { ElementaRenderer } from "../../../elementa_renderer";
import { InstanceRenderable } from "../instance";

export abstract class ElementRenderable<
  I extends ElementInstance = ElementInstance,
> extends InstanceRenderable<I> {
  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: I;
  }) {
    super({ instance, renderer });
  }
}
