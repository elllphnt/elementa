import { ElementData } from "@elllphnt/elementa-base";
import { Project } from "../../../../infrastructure/_.js";
import { ComponentElementModel } from "./component.js";
import { ContainerElementModel } from "./container.js";
import { MediaElementModel } from "./media.js";
import { PrimitiveElementModel } from "./primitive/primitive.js";
import { SlotElementModel } from "./slot.js";
import { TextElementModel } from "./text.js";
import { VectorElementModel } from "./vector.js";

export type ElementModel =
  | ComponentElementModel
  | ContainerElementModel
  | MediaElementModel
  | PrimitiveElementModel
  | SlotElementModel
  | TextElementModel
  | VectorElementModel;

export function createElementModel({
  init,
  project,
}: {
  init: ElementData;
  project: Project;
}): ElementModel {
  switch (init.type) {
    case "container":
      return new ContainerElementModel({ init, project });
    case "text":
      return new TextElementModel({ init, project });
    case "vector":
      return new VectorElementModel({ init, project });
    case "slot":
      return new SlotElementModel({ init, project });
    case "media":
      return new MediaElementModel({ init, project });
    case "component":
      return new ComponentElementModel({ init, project });
    case "primitive":
      return new PrimitiveElementModel({ init, project });
    default:
      throw new Error(`Unknown element type: ${(init as any).type}`);
  }
}
