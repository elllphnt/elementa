/**
 * Either a direct value or an expression string to be evaluated at runtime.
 */
export type Evaluable<T> = T | Expression<T>;

/**
 * Expression-based value with optional fallback.
 */
export type Expression<T = any> = {
  __expression: string;
  fallback?: T;
};

/**
 * Reference to an external variable or object, with optional fallback.
 */
export type StaticReference<T = any> = {
  __reference: {
    type: string; // e.g. "state", "prop"
  };
  fallback?: T;
};

// === Component Model ===

/**
 * The top-level definition of a component in Elll.
 */
export type ComponentData = {
  name?: string;
  props?: DataInputData[]; // Component-level input props
  template?: FragmentData; // Main fragment rendered by this component
  fragments?: FragmentData[]; // Additional reusable fragments
  states?: StateData[]; // Local state definitions
};

/**
 * Input definition for a component prop.
 */
type DataInputData = {
  name: string;
  varName?: string;
  tsType?: string;
  required?: boolean;
  defaultValue?: any;
};

/**
 * Base identifiable object (used in elements, fragments, etc).
 */
type IdentifiableData = {
  id: string;
};

// === Fragment ===

/**
 * A group of nodes (elements) rendered together.
 */
type FragmentData = IdentifiableData & {
  content?: ElementData[];
  providers?: ProviderData[];
};

// === State ===

type StateData = ValueStateData | HookStateData;

type BaseStateData<T extends string> = IdentifiableData & {
  type: T;
  name?: string;
  varName?: string;
};

type ValueStateData = BaseStateData<"value"> & {
  init?: Evaluable<any>;
  tsType?: string;
};

type HookStateData = BaseStateData<"hook"> & {
  hookUrl?: string;
  args?: Evaluable<any>[];
};

// === Provider ===

type ProviderData = ContextProviderData;

type BaseProviderData<T extends string> = {
  type: T;
  name?: string;
};

type ContextProviderData = BaseProviderData<"context"> & {
  contextUrl?: string;
  value?: Evaluable<any>;
};

// === Element Tree ===

/**
 * All supported element types in the component tree.
 */
type ElementData =
  | ComponentElementData
  | ContainerElementData
  | MediaElementData
  | PrimitiveElementData
  | SlotElementData
  | TextElementData
  | VectorElementData;

/**
 * A reusable base structure applied to every element.
 */
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

type ElementContainerData = {
  content?: ElementData[];
};
type SlotFillData = StylableData & InteractiveData & ElementContainerData & {};

// === Element Subtypes ===

type ContainerElementData = BaseElementData<"container"> & {
  content?: ElementData[];
};

type ComponentElementData = BaseElementData<"component"> & {
  componentUrl?: string;
  props?: Record<string, Evaluable<any>>;
  fills?: Record<string, SlotFillData>;
};

type SlotElementData = BaseElementData<"slot"> & {
  mode?: "fill" | "outlet";
  placeholder?: ElementData[];
};

type PrimitiveElementData = BaseElementData<"primitive"> & {
  primitiveUrl?: string;
  props?: Record<string, Evaluable<any>>;
  elements?: Record<string, PrimitiveSubElementData>;
  content?: ElementData[];
};

type PrimitiveSubElementData = StylableData & InteractiveData;

type TextElementData = BaseElementData<"text"> & {
  text?: Evaluable<string>;
  marks?: TextMarkData[];
};

type BaseMediaData = {
  src?: Evaluable<string>;
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
  poster?: Evaluable<string>;
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

type VectorElementData = BaseElementData<"vector"> & {
  width?: Evaluable<string | number>;
  height?: Evaluable<string | number>;
  viewBox?: Evaluable<string>;
  preserveAspectRatio?: Evaluable<string>;
  content?: VectorNodeData[];
};

// === Style System ===

type StylableData = {
  stylesheet?: StyleSheetData;
};

type StyleSheetData = {
  styles?: Record<string, StyleData>;
  conditions?: Record<string, string>;
};

type StyleData = Record<string, string>;

// === Accessibility & Logic ===

type AccessibleData = {
  ariaLabel?: Evaluable<string>;
  ariaHidden?: Evaluable<boolean>;
  ariaRole?: Evaluable<string>;
  tabIndex?: Evaluable<number>;
};

type ConditionalData = {
  condition?: Evaluable<boolean>;
};

type RepeatableData = {
  repeat?: {
    mode?: "fixed" | "dynamic";
    count?: Evaluable<number>;
    dataset?: Evaluable<any[]>;
  };
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

type LinkableData = {
  link?: RouteLinkData | HrefLinkData;
};

type BaseLinkData<T extends string> = StylableData & {
  type: T;
};

type RouteLinkData = BaseLinkData<"route"> & {
  routeUrl?: string;
  params?: Record<string, Evaluable<any>>;
  query?: Record<string, Evaluable<any>>;
  state?: Record<string, Evaluable<any>>;
};

type HrefLinkData = BaseLinkData<"href"> & {
  href?: Evaluable<string>;
  hreflang?: Evaluable<string>;
  ping?: Evaluable<string[]>;
  referrerPolicy?: Evaluable<string>;
  rel?: Evaluable<string>;
  target?: Evaluable<string>;
};

// === Text Marks ===

type TextMarkData = StylableData &
  LinkableData &
  InteractiveData & {
    tag?: string;
  };

// === Vector Content ===

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
