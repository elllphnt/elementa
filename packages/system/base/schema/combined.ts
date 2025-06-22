export type ResolvableOrEvaluable<T> = Resolvable<T> | Evaluable<T>;

export type Expression<T = any> = {
  __expression: string;
  fallback?: T;
};
export type Evaluable<T> = T | Expression<T>;
export type Evaluatee<T> = T extends Evaluable<infer U> ? U : T;

export type StaticReference<T = any> = {
  __reference: {
    type: string;
  };
  fallback?: T;
};
export type Resolvable<T> = T | StaticReference<T>;
export type StaticReferencee<T> = T extends Resolvable<infer U> ? U : T;

type DataInputData = {
  name: string;
  varName?: string;
  tsType?: string;
  required?: boolean;
  defaultValue?: any;
};

type IdentifiableData = {
  id: string;
};

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  template?: FragmentData;
  fragments?: FragmentData[];
  states?: StateData[];
};

type BaseElementData<T extends string> = IdentifiableData &
  StylableData &
  RepeatableData &
  ConditionalData &
  InteractiveData &
  LinkableData &
  AccessibleData & {
    type: T;
    name?: string;
    tag?: string;
  };

type AccessibleData = {
  ariaLabel?: ResolvableOrEvaluable<string>;
  ariaHidden?: ResolvableOrEvaluable<boolean>;
  ariaRole?: ResolvableOrEvaluable<string>;
  tabIndex?: ResolvableOrEvaluable<number>;
};

type ConditionalData = {
  condition?: Evaluable<boolean>;
};

type ElementContainerData = {
  content?: ElementData[];
};

type InteractionEvent =
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

type InteractiveData = {
  interactions?: Partial<Record<InteractionEvent, Expression>>;
};

type BaseLinkData<T extends string> = StylableData & {
  type: T;
};

type RouteLinkData = BaseLinkData<"route"> & {
  routeUrl?: string;
  params?: Record<string, ResolvableOrEvaluable<any>>;
  query?: Record<string, ResolvableOrEvaluable<any>>;
  state?: Record<string, ResolvableOrEvaluable<any>>;
};

type HrefLinkData = BaseLinkData<"href"> & {
  href?: ResolvableOrEvaluable<string>;
  hreflang?: ResolvableOrEvaluable<string>;
  ping?: ResolvableOrEvaluable<string[]>;
  referrerPolicy?: ResolvableOrEvaluable<string>;
  rel?: ResolvableOrEvaluable<string>;
  target?: ResolvableOrEvaluable<string>;
};

type LinkData = RouteLinkData | HrefLinkData;

type LinkableData = {
  link?: LinkData;
};

type RepeatMode = "fixed" | "dynamic";

type ElementRepeatData = {
  mode?: RepeatMode;
  count?: Evaluable<number>;
  dataset?: Evaluable<any[]>;
};

type RepeatableData = {
  repeat?: ElementRepeatData;
};

type StyleData = Record<string, string>;
type StyleSheetData = {
  styles?: Record<string, StyleData>;
  conditions?: Record<string, string>;
};

type StylableData = {
  stylesheet?: StyleSheetData;
};

type SlotFillData = StylableData & InteractiveData & ElementContainerData & {};

type ComponentElementData = BaseElementData<"component"> & {
  componentUrl?: string;
  props?: Record<string, ResolvableOrEvaluable<any>>;
  fills?: Record<string, SlotFillData>;
};

type ContainerElementData = BaseElementData<"container"> &
  ElementContainerData & {};

type ElementData =
  | ComponentElementData
  | ContainerElementData
  | MediaElementData
  | PrimitiveElementData
  | SlotElementData
  | TextElementData
  | VectorElementData;

type BaseMediaData = {
  src?: ResolvableOrEvaluable<string>;
};

type ImageMediaData = BaseMediaData & {
  type: "image";
  alt?: Evaluable<string>;
};

type VideoMediaData = BaseMediaData & {
  type: "video";
  autoplay?: Evaluable<string>;
  loop?: Evaluable<string>;
  muted?: Evaluable<string>;
  controls?: Evaluable<string>;
  poster?: ResolvableOrEvaluable<string>;
};

type MediaData = ImageMediaData | VideoMediaData;

type MediaElementData = BaseElementData<"media"> & {
  fit?: Evaluable<"contain" | "cover" | "fill" | "none" | "scale-down">;
  position?: {
    x?: Evaluable<string | number>;
    y?: Evaluable<string | number>;
  };
  media?: MediaData;
};

type PrimitiveSubElementData = StylableData & InteractiveData & {};

type PrimitiveElementData = BaseElementData<"primitive"> &
  ElementContainerData & {
    primitiveUrl?: string;
    props?: Record<string, ResolvableOrEvaluable<any>>;
    elements?: Record<string, PrimitiveSubElementData>;
  };

type SlotElementData = BaseElementData<"slot"> & {
  mode?: "fill" | "outlet";
  placeholder?: ElementData[];
};

type TextMarkData = StylableData &
  LinkableData &
  InteractiveData & {
    tag?: string;
  };

type TextElementData = BaseElementData<"text"> & {
  text?: ResolvableOrEvaluable<string>;
  marks?: TextMarkData[];
};

type VectorTextNodeData = {
  type: "text";
  value: string;
};

type VectorElementNodeData = {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children: VectorNodeData[];
};

type VectorNodeData = VectorTextNodeData | VectorElementNodeData;

type VectorElementData = BaseElementData<"vector"> & {
  width?: Evaluable<string | number>;
  height?: Evaluable<string | number>;
  viewBox?: Evaluable<string>;
  preserveAspectRatio?: Evaluable<string>;
  content?: VectorNodeData[];
};

type FragmentData = IdentifiableData &
  ElementContainerData & {
    providers?: ProviderData[];
  };

type BaseStateData<T extends string> = IdentifiableData & {
  type: T;
  name?: string;
  varName?: string;
};

type HookStateData = BaseStateData<"hook"> & {
  hookUrl?: string;
  args?: (Evaluable<any> | Resolvable<any>)[];
};

type StateData = ValueStateData | HookStateData;

type ValueStateData = BaseStateData<"value"> & {
  init?: Evaluable<any> | Resolvable<any>;
  tsType?: string;
};

type BaseProviderData<T extends string> = {
  type: T;
  name?: string;
};

type ContextProviderData = BaseProviderData<"context"> & {
  contextUrl?: string;
  value?: Evaluable<any> | Resolvable<any>;
};

type ProviderData = ContextProviderData;
