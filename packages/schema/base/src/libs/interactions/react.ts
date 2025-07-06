import type { InteractionEvent } from "../../types/_.js";

export const reactInteractionEventMap: Record<InteractionEvent, string> = {
  // Mouse events
  click: "onClick",
  dblclick: "onDoubleClick",
  mousedown: "onMouseDown",
  mouseup: "onMouseUp",
  mouseenter: "onMouseEnter",
  mouseleave: "onMouseLeave",
  mouseover: "onMouseOver",
  mouseout: "onMouseOut",
  mousemove: "onMouseMove",
  contextmenu: "onContextMenu",

  // Keyboard events
  keydown: "onKeyDown",
  keypress: "onKeyPress",
  keyup: "onKeyUp",

  // Focus events
  focus: "onFocus",
  blur: "onBlur",
  focusin: "onFocusIn",
  focusout: "onFocusOut",

  // Form & input events
  change: "onChange",
  input: "onInput",
  submit: "onSubmit",
  reset: "onReset",
  invalid: "onInvalid",
  select: "onSelect",

  // Clipboard events
  copy: "onCopy",
  cut: "onCut",
  paste: "onPaste",

  // Composition events
  compositionstart: "onCompositionStart",
  compositionupdate: "onCompositionUpdate",
  compositionend: "onCompositionEnd",

  // Drag & drop events
  drag: "onDrag",
  dragstart: "onDragStart",
  dragend: "onDragEnd",
  dragenter: "onDragEnter",
  dragexit: "onDragExit",
  dragleave: "onDragLeave",
  dragover: "onDragOver",
  drop: "onDrop",

  // Touch events
  touchstart: "onTouchStart",
  touchmove: "onTouchMove",
  touchend: "onTouchEnd",
  touchcancel: "onTouchCancel",

  // Pointer events
  pointerdown: "onPointerDown",
  pointermove: "onPointerMove",
  pointerup: "onPointerUp",
  pointercancel: "onPointerCancel",
  pointerenter: "onPointerEnter",
  pointerleave: "onPointerLeave",
  pointerover: "onPointerOver",
  pointerout: "onPointerOut",

  // Wheel & scroll
  scroll: "onScroll",
  wheel: "onWheel",

  // Media events
  play: "onPlay",
  pause: "onPause",
  ended: "onEnded",
  volumechange: "onVolumeChange",
  timeupdate: "onTimeUpdate",
  seeked: "onSeeked",
  seeking: "onSeeking",
  loadeddata: "onLoadedData",
  loadedmetadata: "onLoadedMetadata",
  error: "onError",

  // Animation & transition events
  animationstart: "onAnimationStart",
  animationend: "onAnimationEnd",
  animationiteration: "onAnimationIteration",
  transitionend: "onTransitionEnd",
};
