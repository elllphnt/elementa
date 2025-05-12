import { ComponentElement } from "./component.js";
import { ContainerElement } from "./container.js";
import { MediaElement } from "./media.js";
import { PrimitiveElement } from "./primitive/_.js";
import { SlotElement } from "./slot.js";
import { TextElement } from "./text.js";
import { VectorElement } from "./vector.js";

export type Element =
  | ComponentElement
  | PrimitiveElement
  | ContainerElement
  | MediaElement
  | SlotElement
  | TextElement
  | VectorElement;
