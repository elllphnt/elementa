import type {
  ComponentElementRenderable,
  ContainerElementRenderable,
  ElementRenderable,
  MediaElementRenderable,
  PrimitiveElementRenderable,
  SlotElementRenderable,
  TextElementRenderable,
  VectorElementRenderable,
} from "@elllphnt/elementa-scene";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { ComponentElementHandle } from "./component.js";
import { ContainerElementHandle } from "./container.js";
import { MediaElementHandle } from "./media.js";
import { PrimitiveElementHandle } from "./primitive.js";
import { SlotElementHandle } from "./slot.js";
import { TextElementHandle } from "./text/text.js";
import { VectorElementHandle } from "./vector.js";

export type ElementHandle =
  | ComponentElementHandle
  | ContainerElementHandle
  | MediaElementHandle
  | PrimitiveElementHandle
  | SlotElementHandle
  | VectorElementHandle
  | TextElementHandle;

export function createElementHandle({
  interactor,
  renderable,
  parent,
}: {
  interactor: ElementaInteractor;
  renderable: ElementRenderable;
  parent: Handle | null;
}): ElementHandle {
  switch (renderable.instance.element.type) {
    case "component":
      return new ComponentElementHandle({
        interactor,
        renderable: renderable as ComponentElementRenderable,
        parent,
      });
    case "container":
      return new ContainerElementHandle({
        interactor,
        renderable: renderable as ContainerElementRenderable,
        parent,
      });
    case "media":
      return new MediaElementHandle({
        interactor,
        renderable: renderable as MediaElementRenderable,
        parent,
      });
    case "primitive":
      return new PrimitiveElementHandle({
        interactor,
        renderable: renderable as PrimitiveElementRenderable,
        parent,
      });
    case "slot":
      return new SlotElementHandle({
        interactor,
        renderable: renderable as SlotElementRenderable,
        parent,
      });
    case "vector":
      return new VectorElementHandle({
        interactor,
        renderable: renderable as VectorElementRenderable,
        parent,
      });
    case "text":
      return new TextElementHandle({
        interactor,
        renderable: renderable as TextElementRenderable,
        parent,
      });
    default:
      throw new Error(
        `Unknown element type: ${(renderable.instance.element as any).type}`
      );
  }
}
