import { z } from "zod";
import { Expression, expressionSchema } from "../../../_primitives/_.js";

// Types

export type InteractionEvent =
  // Mouse events
  | "click"
  | "dblclick"
  | "mousedown"
  | "mouseup"
  | "mouseenter"
  | "mouseleave"
  | "mouseover"
  | "mouseout"
  | "mousemove"
  | "contextmenu"

  // Keyboard events
  | "keydown"
  | "keypress"
  | "keyup"

  // Focus events
  | "focus"
  | "blur"
  | "focusin"
  | "focusout"

  // Form & input events
  | "change"
  | "input"
  | "submit"
  | "reset"
  | "invalid"
  | "select"

  // Clipboard
  | "copy"
  | "cut"
  | "paste"

  // Composition events
  | "compositionstart"
  | "compositionupdate"
  | "compositionend"

  // Drag & drop
  | "drag"
  | "dragstart"
  | "dragend"
  | "dragenter"
  | "dragexit"
  | "dragleave"
  | "dragover"
  | "drop"

  // Touch events
  | "touchstart"
  | "touchmove"
  | "touchend"
  | "touchcancel"

  // Pointer events
  | "pointerdown"
  | "pointermove"
  | "pointerup"
  | "pointercancel"
  | "pointerenter"
  | "pointerleave"
  | "pointerover"
  | "pointerout"

  // Wheel & scroll
  | "scroll"
  | "wheel"

  // Media
  | "play"
  | "pause"
  | "ended"
  | "volumechange"
  | "timeupdate"
  | "seeked"
  | "seeking"
  | "loadeddata"
  | "loadedmetadata"
  | "error"

  // Animation & transition
  | "animationstart"
  | "animationend"
  | "animationiteration"
  | "transitionend";

export type InteractiveData = {
  interactions?: Partial<Record<InteractionEvent, Expression>>;
};

// Schemas

export const interactiveDataSchema = z.object({
  interactions: z.record(expressionSchema(z.any())).optional(),
});
