export type ArrayItem<T> = T extends (infer U)[] ? U : T;

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

export type ErrorTupple<T> = [undefined, Error] | [T, undefined];

export type AxisData<T> = {
  x?: T;
  y?: T;
};

export type EdgeData<T> = {
  top?: T;
  right?: T;
  bottom?: T;
  left?: T;
};

export type CornerData<T> = {
  topLeft?: T;
  topRight?: T;
  bottomRight?: T;
  bottomLeft?: T;
};

export type AreaData<T> = {
  x?: T;
  y?: T;
};

export type CssSelector = string[];

export enum StyleDataType {
  Boolean = "boolean",
  Number = "number",
  String = "string",
  Angle = "angle",
  Color = "color",
  Duration = "duration",
  Flex = "flex",
  Length = "length",
  Percent = "percent",
  Ratio = "ratio",
}

// === Dimensions ===
export type DimensionData<U extends string> = {
  value: number;
  unit: U;
};

export type LengthData = DimensionData<"px" | "em" | "rem" | "vh" | "vw">;
export type PercentData = DimensionData<"%">;
export type FlexData = DimensionData<"fr">;
export type DurationData = DimensionData<"s" | "ms">;
export type AngleData = DimensionData<"deg" | "rad" | "grad" | "turn">;

export type LengthOrPercentData = LengthData | PercentData;
export type LengthOrFlexData = LengthData | FlexData;
export type LengthOrFlexOrPercentData = LengthData | PercentData | FlexData;
export type AngleOrPercentData = AngleData | PercentData;

// === Color ===
export type ColorData = {
  value: number[];
  model: "rgb" | "hsl" | "hwb" | "lab" | "lch" | "oklab" | "oklch";
  alpha?: number;
};

// === Ratio ===
export type RatioData = [number, number];

// === Map ===
export type StyleDataTypeMap = {
  [StyleDataType.Boolean]: boolean;
  [StyleDataType.Number]: number;
  [StyleDataType.String]: string;
  [StyleDataType.Angle]: AngleData;
  [StyleDataType.Color]: ColorData;
  [StyleDataType.Duration]: DurationData;
  [StyleDataType.Flex]: FlexData;
  [StyleDataType.Length]: LengthData;
  [StyleDataType.Percent]: PercentData;
  [StyleDataType.Ratio]: RatioData;
};

export type StyleDataData =
  | boolean
  | number
  | string
  | AngleData
  | ColorData
  | DurationData
  | FlexData
  | LengthData
  | PercentData
  | RatioData;

export type VarRef<T = any> = {
  __var: string;
  options?: Record<string, any>;
  fallback?: T;
};

export type Variable<T> = T | VarRef<T>;
export type MapWithVarRefs<T extends Record<string, any>> = {
  [key in keyof T]?: T[key] | VarRef<T[key]>;
};

export type CrdtAtomic = {
  __crdtAtomic: string[];
};

export type DataInputData = {
  name: string;
  varName?: string;
  tsType?: string;
  required?: boolean;
  defaultValue?: Resolvable<any>;
};

export type IdentifiableData = {
  id: string;
};

export type AppData = {
  routes?: RouteTreeData[];
  providers?: ProviderData[];
  editors?: Record<string, Record<string, any>>;
};

export type BlueprintNodeData = CrdtAtomic & {
  id: string;
  position: {
    x: number;
    y: number;
  };
};

export type AppBlueprintData = {
  nodes?: BlueprintNodeData[];
};

export type RouteData = IdentifiableData & {
  path?: string;
  parentId?: string;
  loaderUrl?: string;
  handlerUrl?: string;
  mainViewUrl?: string;
  errorViewUrl?: string;
  pendingViewUrl?: string;
  notFoundViewUrl?: string;
};

export type RouteTreeData = RouteData & {
  children?: RouteTreeData[];
};

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  template?: FragmentData;
  fragments?: FragmentData[];
  states?: StateData[];
  editors?: Record<string, Record<string, any>>;
};

export type ElementaFrameData = IdentifiableData & {
  name?: string;
  context?: RenderingContextData;
  content?: RenderableContentData;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  corners?: CornerData<number>;
};

export type ElementaPreviewData = {
  context?: RenderingContextData;
  content?: RenderableContentData;
  corners?: CornerData<number>;
};

export type BaseRenderableContentData<T extends string> = {
  type: T;
};

export type ComponentRenderableContentData =
  BaseRenderableContentData<"component"> & {
    componentUrl?: string;
    props?: Record<string, any>;
    fills?: Record<string, SlotFillData>;
  };

export type FragmentRenderableContentData =
  BaseRenderableContentData<"fragment"> & {
    fragmentUrl?: string;
    params?: Record<string, any>;
  };

export type AppRenderableContentData = BaseRenderableContentData<"app"> & {
  appUrl?: string;
  variables?: Record<string, any>;
};

export type RenderableContentData =
  | ComponentRenderableContentData
  | FragmentRenderableContentData
  | AppRenderableContentData;

export type ColorThemeData = {
  scheme?: string;
  foreground?: ColorData;
  background?: ColorData;
};

export type ViewportData = {
  height?: number;
  width?: number;
  overflow?: OverflowValue;
};

export type RenderingContextData = {
  theme?: ColorThemeData;
  viewport?: ViewportData;
  viewportEnabled?: boolean;
  styleModifierEnabled?: boolean;
  styleModifiers?: StyleModifierData[];
};

export type ElementaStageData = {
  frames?: ElementaFrameData[];
};

export type BaseElementData<T extends string> = IdentifiableData &
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

export type AccessibleData = {
  ariaLabel?: ResolvableOrEvaluable<string>;
  ariaHidden?: ResolvableOrEvaluable<boolean>;
  ariaRole?: ResolvableOrEvaluable<string>;
  tabIndex?: ResolvableOrEvaluable<number>;
};

export type ConditionalData = {
  condition?: Evaluable<boolean>;
};

export type ElementContainerData = {
  content?: ElementData[];
};

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

export type BaseLinkData<T extends string> = StylableData & {
  type: T;
};

export type RouteLinkData = BaseLinkData<"route"> & {
  routeUrl?: string;
  params?: Record<string, ResolvableOrEvaluable<any>>;
  query?: Record<string, ResolvableOrEvaluable<any>>;
  state?: Record<string, ResolvableOrEvaluable<any>>;
};

export type HrefLinkData = BaseLinkData<"href"> & {
  href?: ResolvableOrEvaluable<string>;
  hreflang?: ResolvableOrEvaluable<string>;
  ping?: ResolvableOrEvaluable<string[]>;
  referrerPolicy?: ResolvableOrEvaluable<string>;
  rel?: ResolvableOrEvaluable<string>;
  target?: ResolvableOrEvaluable<string>;
};

export type LinkData = RouteLinkData | HrefLinkData;

export type LinkableData = {
  link?: LinkData;
};

export type RepeatMode = "fixed" | "dynamic";

export type ElementRepeatData = {
  mode?: RepeatMode;
  count?: Evaluable<number>;
  dataset?: Evaluable<any[]>;
};

export type RepeatableData = {
  repeat?: ElementRepeatData;
};

export type StylableData = {
  stylesheet?: StyleSheetData;
};

export type SlotFillData = StylableData &
  InteractiveData &
  ElementContainerData & {};

export type ComponentElementData = BaseElementData<"component"> & {
  componentUrl?: string;
  props?: Record<string, ResolvableOrEvaluable<any>>;
  fills?: Record<string, SlotFillData>;
};

export type ContainerElementData = BaseElementData<"container"> &
  ElementContainerData & {};

export type ElementData =
  | ComponentElementData
  | ContainerElementData
  | MediaElementData
  | PrimitiveElementData
  | SlotElementData
  | TextElementData
  | VectorElementData;

export type BaseMediaData = {
  src?: ResolvableOrEvaluable<string>;
};

export type ImageMediaData = BaseMediaData & {
  type: "image";
  alt?: Evaluable<string>;
};

export type VideoMediaData = BaseMediaData & {
  type: "video";
  autoplay?: Evaluable<string>;
  loop?: Evaluable<string>;
  muted?: Evaluable<string>;
  controls?: Evaluable<string>;
  poster?: ResolvableOrEvaluable<string>;
};

export type MediaData = ImageMediaData | VideoMediaData;

export type MediaElementData = BaseElementData<"media"> & {
  fit?: Evaluable<"contain" | "cover" | "fill" | "none" | "scale-down">;
  position?: {
    x?: Evaluable<LengthData | PercentData>;
    y?: Evaluable<LengthData | PercentData>;
  };
  media?: MediaData;
};

export type PrimitiveSubElementData = StylableData & InteractiveData & {};

export type PrimitiveElementData = BaseElementData<"primitive"> &
  ElementContainerData & {
    primitiveUrl?: string;
    props?: Record<string, ResolvableOrEvaluable<any>>;
    elements?: Record<string, PrimitiveSubElementData>;
  };

export type SlotElementData = BaseElementData<"slot"> & {
  mode?: "fill" | "outlet";
  placeholder?: ElementData[];
};

export type TextMarkData = StylableData &
  LinkableData &
  InteractiveData & {
    tag?: string;
  };

export type TextElementData = BaseElementData<"text"> & {
  text?: ResolvableOrEvaluable<string>;
  marks?: TextMarkData[];
};

export type VectorTextNodeData = {
  type: "text";
  value: string;
};

export type VectorElementNodeData = {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children: VectorNodeData[];
};

export type VectorNodeData = VectorTextNodeData | VectorElementNodeData;

export type VectorElementData = BaseElementData<"vector"> & {
  width?: Evaluable<string | number>;
  height?: Evaluable<string | number>;
  viewBox?: Evaluable<string>;
  preserveAspectRatio?: Evaluable<string>;
  content?: VectorNodeData[];
};

export type FragmentData = IdentifiableData &
  ElementContainerData & {
    providers?: ProviderData[];
  };

export type BaseStateData<T extends string> = IdentifiableData & {
  type: T;
  name?: string;
  varName?: string;
};

export type HookStateData = BaseStateData<"hook"> & {
  hookUrl?: string;
  args?: (Evaluable<any> | Resolvable<any>)[];
};

export type StateData = ValueStateData | HookStateData;

export type ValueStateData = BaseStateData<"value"> & {
  init?: Evaluable<any> | Resolvable<any>;
  tsType?: string;
};

export type DataInputConfig = {
  name?: string;
  identifier?: string;
  tsType?: string;
  required?: boolean;
};

export type ContextConfig = {
  tsType?: string;
};

export type HookConfig = {
  parameters?: DataInputConfig[];
};

export type PrimitiveElementConfig = {
  name?: string;
  description?: string;
};

export type PrimitiveConfig = {
  props?: Record<string, DataInputConfig>;
  isContainer?: boolean;
  init?: Partial<PrimitiveElementData>;
  elements?: Record<string, PrimitiveElementConfig>;
};

export type RoutineConfig = {
  parameters?: DataInputConfig[];
};

export type BaseProviderData<T extends string> = {
  type: T;
  name?: string;
};

export type ContextProviderData = BaseProviderData<"context"> & {
  contextUrl?: string;
  value?: Evaluable<any> | Resolvable<any>;
};

export type ProviderData = ContextProviderData;

export type KeyFrameData = {
  key?: string;
  offset?: number;
  style?: StyleData;
};

export type KeyframeSetData = {
  id?: string;
  name?: string;
  keyframes?: KeyFrameData[];
  styleFragments?: StyleFragmentData[];
};

export enum StyleModifierType {
  Context = "context",
  Element = "element",
}

export type StyleModifierDefinitionData = {
  id: string;
  name: string;
  type: StyleModifierType;
  signature?: StyleDataType[];
  predecence?: number;
  selector?: string[];
};

export type StyleModifierData = {
  name: string;
  args?: any[];
};

export type ElllSelectorData = StyleModifierData[];

export type AnimationData = {
  keyframe?: Variable<string>;
  duration?: Variable<DurationData>;
  timingFunction?: Variable<string>;
  delay?: Variable<DurationData>;
  iterations?: Variable<number>;
  direction?: Variable<string>;
  fillMode?: Variable<string>;
  playState?: Variable<string>;
};

export type LinearGradientStopData = {
  position: PercentData;
  color: Variable<ColorData>;
};
export type AngularGradientStopData = {
  angle: AngleData;
  color: Variable<ColorData>;
};

export type BaseGradientData = {
  type?: string;
  repeat?: boolean;
};
export type LinearGradientData = BaseGradientData & {
  type?: "linear";
  angle?: Variable<AngleData>;
  stops?: Array<LinearGradientStopData>;
};
export type RadialGradientData = BaseGradientData & {
  type?: "radial";
  shape?: Variable<"ellipse" | "circle">;
  size?: Variable<LengthOrPercentData>;
  position?: {
    x: Variable<LengthOrPercentData>;
    y: Variable<LengthOrPercentData>;
  };
  stops: Array<LinearGradientStopData>;
};
export type ConicGradientData = BaseGradientData & {
  type?: "conic";
  angle?: Variable<AngleData>;
  position?: {
    x: Variable<LengthOrPercentData>;
    y: Variable<LengthOrPercentData>;
  };
  stops?: AngularGradientStopData[];
};
export type GradientData =
  | LinearGradientData
  | RadialGradientData
  | ConicGradientData;

export type BaseBackgroundLayerData = {
  type?: string;
};
export type GradientBackgroundLayerData = BaseBackgroundLayerData & {
  type?: "gradient";
  gradient?: GradientData;
};
export type ImageBackgroundLayerData = BaseBackgroundLayerData & {
  type?: "image";
  url?: Variable<string>;
  position?: {
    x: Variable<LengthOrPercentData>;
    y: Variable<LengthOrPercentData>;
  };
  size?: Variable<"auto" | "cover" | "contain" | LengthOrPercentData>;
  repeat?: Variable<"repeat" | "repeat-x" | "repeat-y" | "no-repeat">;
  clip?: Variable<"border-box" | "padding-box" | "content-box">;
  origin?: Variable<"border-box" | "padding-box" | "content-box">;
  attachment?: Variable<"scroll" | "fixed" | "local">;
};
export type BackgroundLayerData =
  | GradientBackgroundLayerData
  | ImageBackgroundLayerData;

export type BaseFilterData = {
  type: string;
  backdrop?: boolean;
};

export type BlurFilterData = BaseFilterData & {
  type: "blur";
  radius: Variable<LengthOrPercentData>;
};

export type BrightnessFilterData = BaseFilterData & {
  type: "brightness";
  amount: Variable<number>;
};

export type ContrastFilterData = BaseFilterData & {
  type: "contrast";
  amount: Variable<number>;
};

export type DropShadowFilterData = BaseFilterData & {
  type: "drop-shadow";
  offsetX: Variable<LengthData>;
  offsetY: Variable<LengthData>;
  standardDeviation?: Variable<LengthData>;
  color?: Variable<ColorData>;
};

export type BoxShadowFilterData = BaseFilterData & {
  type: "box-shadow";
  inset?: Variable<boolean>;
  offsetX: Variable<LengthData>;
  offsetY: Variable<LengthData>;
  blurRadius?: Variable<LengthData>;
  spreadRadius?: Variable<LengthData>;
  color?: Variable<ColorData>;
};

export type TextShadowFilterData = BaseFilterData & {
  type: "text-shadow";
  offsetX: Variable<LengthData>;
  offsetY: Variable<LengthData>;
  blurRadius?: Variable<LengthData>;
  color?: Variable<ColorData>;
};

export type GrayscaleFilterData = BaseFilterData & {
  type: "grayscale";
  amount: Variable<number>;
};

export type HueRotateFilterData = BaseFilterData & {
  type: "hue-rotate";
  angle: Variable<AngleData>;
};

export type InvertFilterData = BaseFilterData & {
  type: "invert";
  amount: Variable<number>;
};

export type OpacityFilterData = BaseFilterData & {
  type: "opacity";
  amount: Variable<number>;
};

export type SaturateFilterData = BaseFilterData & {
  type: "saturate";
  amount: Variable<number>;
};

export type SepiaFilterData = BaseFilterData & {
  type: "sepia";
  amount: Variable<number>;
};

export type FilterData =
  | BlurFilterData
  | BrightnessFilterData
  | ContrastFilterData
  | DropShadowFilterData
  | BoxShadowFilterData
  | TextShadowFilterData
  | GrayscaleFilterData
  | HueRotateFilterData
  | InvertFilterData
  | OpacityFilterData
  | SaturateFilterData
  | SepiaFilterData;

export enum StyleFragmentType {
  Animation = "animation",
  BackgroundLayer = "backgroundLayer",
  Filter = "filter",
}

export type StyleFragmentDataTypeMap = {
  [StyleFragmentType.Animation]: any;
  [StyleFragmentType.BackgroundLayer]: any;
  [StyleFragmentType.Filter]: any;
};

export type StyleFragmentData<T extends StyleFragmentType = StyleFragmentType> =
  {
    id: string;
    type: T;
    data: StyleFragmentDataTypeMap[T];
  };

export type StylePropertyName = keyof RawStyleData;

export type StylePropertyConfig<
  N extends StylePropertyName = StylePropertyName
> = {
  types: StyleDataType[];
  property?: string;
  init?: StyleData[N];
  inherit?: boolean;
};

export type CornerName =
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";
export type EdgeName = "top" | "right" | "bottom" | "left";

export type LayoutValue = "flex" | "grid" | "none";
export type FlexDirectionValue = "row" | "column";
export type AlignItemsValue = "start" | "center" | "end" | "stretch";
export type JustifyItemsValue =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";
export type AlignContentValue =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";
export type JustifyContentValue = "start" | "center" | "end" | "stretch";
export type OverflowValue =
  | "visible"
  | "hidden"
  | "scroll-x"
  | "scroll-y"
  | "scroll-area";
export type BackgroundScaleValue = "cover" | "contain" | "auto";
export type FlexWrapValue = "wrap" | "nowrap";
export type PositionValue =
  | "static"
  | "absolute"
  | "relative"
  | "fixed"
  | "sticky";

export type UnsettableMap<T> = {
  [P in keyof T]: T[P] | "unset";
};

/**
 * A style data object that contains completely resolved values without any references.
 */
export type RawStyleData = {
  // position
  "position"?: PositionValue;
  "top"?: LengthOrPercentData;
  "left"?: LengthOrPercentData;
  "right"?: LengthOrPercentData;
  "bottom"?: LengthOrPercentData;

  // size
  "width"?: LengthOrFlexOrPercentData | "fit";
  "height"?: LengthOrFlexOrPercentData | "fit";
  "min-width"?: LengthOrPercentData;
  "min-height"?: LengthOrPercentData;
  "max-width"?: LengthOrPercentData;
  "max-height"?: LengthOrPercentData;
  "aspect-ratio"?: RatioData;

  // layout
  "display"?: LayoutValue;
  "align-items"?: AlignItemsValue;
  "justify-items"?: JustifyItemsValue;
  "align-content"?: AlignContentValue;
  "justify-content"?: JustifyContentValue;
  "overflow"?: OverflowValue;
  "z-index"?: number;

  // flex
  "flex-direction"?: FlexDirectionValue;
  "flex-wrap"?: FlexWrapValue;

  // grid
  "grid-template-columns"?: number;
  "grid-template-rows"?: number;
  "grid-column"?: number;
  "grid-row"?: number;
  "grid-auto-flow"?: string;

  // gap
  "gap-x"?: LengthData;
  "gap-y"?: LengthData;

  // padding
  "padding-top"?: LengthOrPercentData;
  "padding-right"?: LengthOrPercentData;
  "padding-bottom"?: LengthOrPercentData;
  "padding-left"?: LengthOrPercentData;

  // background
  "background-color"?: ColorData;
  "background-layers"?: string;

  // border
  "border-top-style"?: string;
  "border-top-width"?: LengthData;
  "border-top-color"?: ColorData;
  "border-right-style"?: string;
  "border-right-width"?: LengthData;
  "border-right-color"?: ColorData;
  "border-bottom-style"?: string;
  "border-bottom-width"?: LengthData;
  "border-bottom-color"?: ColorData;
  "border-left-style"?: string;
  "border-left-width"?: LengthData;
  "border-left-color"?: ColorData;

  // outline
  "outline-style"?: string;
  "outline-width"?: LengthData;
  "outline-color"?: ColorData;

  // border radius
  "border-top-left-radius"?: LengthData;
  "border-top-right-radius"?: LengthData;
  "border-bottom-right-radius"?: LengthData;
  "border-bottom-left-radius"?: LengthData;

  // text
  "font-family"?: string;
  "font-weight-style"?: string;
  "font-size"?: LengthData;
  "text-transform"?: string;
  "text-decoration"?: string;
  "letter-spacing"?: LengthData;
  "text-overflow"?: string;
  "white-space"?: string;
  "word-break"?: string;
  "text-align"?: string;
  "line-height"?: LengthData | PercentData;

  // transform
  "translate-x"?: LengthOrPercentData;
  "translate-y"?: LengthOrPercentData;
  "translate-z"?: LengthOrPercentData;
  "rotate-x"?: AngleData;
  "rotate-y"?: AngleData;
  "rotate-z"?: AngleData;
  "scale-x"?: number;
  "scale-y"?: number;
  "scale-z"?: number;
  "skew-x"?: AngleData;
  "skew-y"?: AngleData;

  // style
  "color"?: ColorData;
  "opacity"?: number;
  "visibility"?: string;
  "cursor"?: string;

  // filter
  "filters"?: string;

  // animation
  "animations"?: string;
  "transition-property"?: string;
  "transition-duration"?: DurationData;
  "transition-timing-function"?: string;
  "transition-delay"?: DurationData;
};

export type VariableStyleData = MapWithVarRefs<RawStyleData>;

export type UnsettableStyleData = UnsettableMap<VariableStyleData>;

export type StyleData = UnsettableStyleData & {
  __raw?: Record<string, string>; // raw css style fallback
};

export type StyleSheetData = {
  styles?: Record<string, StyleData>;
  fragments?: StyleFragmentData[];
  conditions?: Record<string, string>;
};

export type VariableFontAxisData = {
  tag: string;
  start: number;
  end: number;
};

export type TypefaceDefinition = {
  family: string;
  srcset: {
    [variant: string]: string;
  };
  variants: string[];
  axes?: Array<VariableFontAxisData>;
  category?: string;
};

export type TypefaceData = {
  id: string;
  name: string;
  definition?: TypefaceDefinition;
  variants?: string[];
};

export type StyleVariableData = {
  name?: string;
  values?: Record<string, any>;
};

export type StyleVariableSetData = {
  id: string;
  name: string;
  datatype?: StyleDataType;
  modes?: ElllSelectorData[];
  variables: StyleVariableData[];
};
