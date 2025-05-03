import {
  ComponentElementInstance,
  ContainerElementInstance,
  ElementInstance,
  MediaElementInstance,
  PrimitiveElementInstance,
  SlotElementInstance,
  TextElementInstance,
  VectorElementInstance,
} from "@elllphnt/elementa-runtime";
import element from "../../components/elements/element";
import { Scene } from "../../scene/scene";
import { ComponentElementRenderable } from "./component";
import { ContainerElementRenderable } from "./container";
import { MediaElementRenderable } from "./media";
import { PrimitiveElementRenderable } from "./primitive";
import { SlotElementRenderable } from "./slot";
import { TextElementRenderable } from "./text";
import { VectorElementRenderable } from "./vector";

export function createElementRenderable({
  scene,
  instance,
}: {
  scene: Scene;
  instance: ElementInstance;
}) {
  switch (instance.element.type) {
    case "container":
      return new ContainerElementRenderable({
        instance: instance as ContainerElementInstance,
        scene,
      });

    case "component":
      return new ComponentElementRenderable({
        instance: instance as ComponentElementInstance,
        scene,
      });

    case "media":
      return new MediaElementRenderable({
        instance: instance as MediaElementInstance,
        scene,
      });

    case "primitive":
      return new PrimitiveElementRenderable({
        instance: instance as PrimitiveElementInstance,
        scene,
      });

    case "slot":
      return new SlotElementRenderable({
        instance: instance as SlotElementInstance,
        scene,
      });

    case "text":
      return new TextElementRenderable({
        instance: instance as TextElementInstance,
        scene,
      });

    case "vector":
      return new VectorElementRenderable({
        instance: instance as VectorElementInstance,
        scene,
      });

    default:
      throw new Error(`Unknown element type: ${(element as any).type}`);
  }
}
