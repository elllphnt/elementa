import type {
  DeepPartial,
  Lifecycle,
  PointData,
  Rect,
  RectData,
  VectorData,
} from "@elllphnt/elementa-utils";
import type { Observable } from "rxjs";

export type ViewportData = {
  pan: VectorData;
  scale: number;
};

export interface IViewport extends Lifecycle {
  readonly scaleMin: number;
  readonly scaleMax: number;

  get initialized(): boolean;
  get contentVisible(): boolean;
  get contentVisible$(): Observable<boolean>;
  get x(): number;
  get x$(): Observable<number>;
  get y(): number;
  get y$(): Observable<number>;
  get width(): number;
  get width$(): Observable<number>;
  get height(): number;
  get height$(): Observable<number>;
  get pan(): PointData;
  get pan$(): Observable<PointData>;
  get scale(): number;
  get scale$(): Observable<number>;
  get initialContentOrigin(): PointData;
  get initialContentOrigin$(): Observable<PointData>;
  get contentOrigin(): PointData;
  get contentOrigin$(): Observable<PointData>;
  get data(): ViewportData;
  get data$(): Observable<ViewportData>;
  get rect(): Rect;

  nearestPixel(point: PointData): PointData;
  nearestPixel$(point: PointData): Observable<PointData>;
  nearestHalfPixel(point: PointData): PointData;
  nearestHalfPixel$(point: PointData): Observable<PointData>;
  roundToPixel(value: number): number;
  roundToPixel$(value: number): Observable<number>;
  rectNearestPixel(rect: RectData): Rect;
  rectNearestPixel$(rect: RectData): Observable<Rect>;
  rectNearestHalfPixel(rect: RectData): Rect;
  rectNearestHalfPixel$(rect: RectData): Observable<Rect>;
  setSize(width: number, height: number): void;
  setPosition(x: number, y: number): void;
  setContentVisible(visible: boolean): void;
  scaleTo(scale: number): void;
  scaleBy(deltaScale: number, origin: { x: number; y: number }): void;
  panTo(pan: { x: number; y: number }): void;
  panBy(deltaX: number, deltaY: number): void;
  setInitialContentOrigin(origin: PointData): void;
  windowToViewport(point: PointData): PointData;
  windowToViewport$(point: PointData): Observable<PointData>;
  viewportToWindow(point: PointData): PointData;
  viewportToWindow$(point: PointData): Observable<PointData>;
  viewportToContent(point: PointData): PointData;
  viewportToContent$(point: PointData): Observable<PointData>;
  contentToViewport(point: PointData): PointData;
  contentToViewport$(point: PointData): Observable<PointData>;
  windowToContent(point: PointData): PointData;
  windowToContent$(point: PointData): Observable<PointData>;
  contentToWindow(point: PointData): PointData;
  vectorWindowToViewport(vector: VectorData): VectorData;
  vectorWindowToViewport$(vector: VectorData): Observable<VectorData>;
  vectorViewportToWindow(vector: VectorData): VectorData;
  vectorViewportToWindow$(vector: VectorData): Observable<VectorData>;
  vectorViewportToContent(vector: VectorData): VectorData;
  vectorViewportToContent$(vector: VectorData): Observable<VectorData>;
  vectorContentToViewport(vector: VectorData): VectorData;
  vectorContentToViewport$(vector: VectorData): Observable<VectorData>;
  vectorWindowToContent(vector: VectorData): VectorData;
  vectorWindowToContent$(vector: VectorData): Observable<VectorData>;
  vectorContentToWindow(vector: VectorData): VectorData;
  vectorContentToWindow$(vector: VectorData): Observable<VectorData>;
  rectWindowToViewport(rect: RectData): Rect;
  rectWindowToViewport$(rect: RectData): Observable<Rect>;
  rectViewportToWindow(rect: RectData): Rect;
  rectViewportToWindow$(rect: RectData): Observable<Rect>;
  rectViewportToContent(rect: RectData): Rect;
  rectViewportToContent$(rect: RectData): Observable<Rect>;
  rectContentToViewport(rect: RectData): Rect;
  rectContentToViewport$(rect: RectData): Observable<Rect>;
  rectWindowToContent(rect: RectData): Rect;
  rectWindowToContent$(rect: RectData): Observable<Rect>;
  rectContentToWindow(rect: RectData): Rect;
  rectContentToWindow$(rect: RectData): Observable<Rect>;
  contentRect(element: HTMLElement): Rect;
  viewportRect(element: HTMLElement): Rect;
  windowRect(element: HTMLElement): Rect;
  staticWindowRect(element: HTMLElement): Rect;
  staticViewportRect(element: HTMLElement): Rect;
  staticContentRect(element: HTMLElement): Rect;
  fitContentRect(contentRect: RectData, viewportRect?: RectData): void;
  restore(data: DeepPartial<ViewportData>): void;
  restoreDiff(data: DeepPartial<ViewportData>): void;
  handleWheel(e: WheelEvent): void;
}
