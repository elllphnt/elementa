import { ElementData } from "@elllphnt/elementa-base";
import { CssStyleSheet } from "../../../../css/_.js";
import { Fragment } from "../fragment.js";
import { ComponentElementModel } from "./component/component.js";
import { ContainerElementModel } from "./container.js";
import { ElementModel } from "./element.js";
import { MediaElementModel } from "./media.js";
import { PrimitiveElementModel } from "./primitive/primitive.js";
import { SlotElementModel } from "./slot.js";
import { TextElementModel } from "./text.js";
import { VectorElementModel } from "./vector.js";

export function createElementModel({
  init,
  fragment,
  cssStyleSheet,
}: {
  init: ElementData;
  fragment: Fragment;
  cssStyleSheet: CssStyleSheet;
}): ElementModel<any> {
  switch (init.type) {
    case "container":
      return new ContainerElementModel({ init, fragment, cssStyleSheet });
    case "text":
      return new TextElementModel({ init, fragment, cssStyleSheet });
    case "vector":
      return new VectorElementModel({ init, fragment, cssStyleSheet });
    case "slot":
      return new SlotElementModel({ init, fragment, cssStyleSheet });
    case "media":
      return new MediaElementModel({ init, fragment, cssStyleSheet });
    case "component":
      return new ComponentElementModel({ init, fragment, cssStyleSheet });
    case "primitive":
      return new PrimitiveElementModel({ init, fragment, cssStyleSheet });
    default:
      throw new Error(`Unknown element type: ${(init as any).type}`);
  }
}
