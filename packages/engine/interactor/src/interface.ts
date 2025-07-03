import { Lifecycle } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type {
  PointData,
  RectData,
  VectorData,
} from "@elllphnt/elementa-math-utils";
import { Rect } from "@elllphnt/elementa-math-utils";
import { BehaviorSubject, distinctUntilChanged, map, of } from "rxjs";
import type { ElementaInteractor } from "./interactor.js";

const MAX_WHEEL_DELTA = 20;

export class Interface extends Lifecycle {
  readonly interactor: ElementaInteractor;

  private _position$ = new BehaviorSubject<PointData>({ x: 0, y: 0 });
  private _size$ = new BehaviorSubject<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  private _stagerWindowRect$ = new BehaviorSubject<RectData>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // New private properties for smooth zooming
  private zoomAnimationFrameId: number | null = null;
  private targetScale: number | null = null;
  private zoomOrigin: { x: number; y: number } | null = null;

  // New private properties for smooth panning
  private panAnimationFrameId: number | null = null;
  private remainingPanDelta: { x: number; y: number } = { x: 0, y: 0 };

  // New properties for mouse wheel event detection
  private lastDeltaY: number = 0;

  get x() {
    return this._position$.value.x;
  }
  get x$() {
    return this._position$.asObservable().pipe(
      map((position) => position.x),
      distinctUntilChanged()
    );
  }

  get y() {
    return this._position$.value.y;
  }
  get y$() {
    return this._position$.asObservable().pipe(
      map((position) => position.y),
      distinctUntilChanged()
    );
  }

  get width() {
    return this._size$.value.width;
  }
  get width$() {
    return this._size$.asObservable().pipe(
      map((size) => size.width),
      distinctUntilChanged()
    );
  }

  get height() {
    return this._size$.value.height;
  }
  get height$() {
    return this._size$.asObservable().pipe(
      map((size) => size.height),
      distinctUntilChanged()
    );
  }

  get stagerWindowRect() {
    return this._stagerWindowRect$.value;
  }
  get stagerWindowRect$() {
    return this._stagerWindowRect$.asObservable();
  }

  constructor({ interactor }: { interactor: ElementaInteractor }) {
    super();
    this.interactor = interactor;

    this.addDisposer(() => {
      this._position$.complete();
      this._size$.complete();
    });
  }

  setSize(width: number, height: number) {
    this._size$.next({ width, height });
  }
  setPosition(x: number, y: number) {
    this._position$.next({ x, y });
  }

  // point
  private _windowToInterface({
    x,
    y,
    point,
  }: {
    point: PointData;
    x: number;
    y: number;
  }) {
    return {
      x: point.x - x,
      y: point.y - y,
    };
  }
  windowToInterface(point: PointData) {
    return this._windowToInterface({
      point,
      x: this.x,
      y: this.y,
    });
  }
  windowToInterface$(point: PointData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._windowToInterface({
          point,
          x,
          y,
        });
      })
    );
  }
  private _interfaceToWindow({
    point,
    x,
    y,
  }: {
    point: PointData;
    x: number;
    y: number;
  }) {
    return {
      x: point.x + x,
      y: point.y + y,
    };
  }
  interfaceToWindow(point: PointData) {
    return this._interfaceToWindow({
      point,
      x: this.x,
      y: this.y,
    });
  }
  interfaceToWindow$(point: PointData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._interfaceToWindow({
          point,
          x,
          y,
        });
      })
    );
  }
  private _interactorToStager({
    stagerRect,
    point,
  }: {
    point: PointData;
    stagerRect: RectData;
  }) {
    return {
      x: point.x - stagerRect.x,
      y: point.y - stagerRect.y,
    };
  }
  interactorToStager(point: PointData) {
    return this._interactorToStager({
      point,
      stagerRect: this.stagerWindowRect,
    });
  }
  interactorToStager$(point: PointData) {
    return this.stagerWindowRect$.pipe(
      map((stagerRect) => {
        return this._interactorToStager({
          point,
          stagerRect,
        });
      })
    );
  }
  private _stagerToInteractor({
    stagerRect,
    point,
  }: {
    point: PointData;
    stagerRect: RectData;
  }) {
    return {
      x: point.x + stagerRect.x,
      y: point.y + stagerRect.y,
    };
  }
  stagerToInteractor(point: PointData) {
    return this._stagerToInteractor({
      point,
      stagerRect: this.stagerWindowRect,
    });
  }
  stagerToInteractor$(point: PointData) {
    return this.stagerWindowRect$.pipe(
      map((stagerRect) => {
        return this._stagerToInteractor({
          point,
          stagerRect,
        });
      })
    );
  }

  // vectordata
  vectorWindowToInterface(vector: VectorData) {
    return vector;
  }
  vectorWindowToInterface$(vector: VectorData) {
    return of(vector);
  }
  vectorInterfaceToWindow(vector: VectorData) {
    return vector;
  }
  vectorInterfaceToWindow$(vector: VectorData) {
    return of(vector);
  }
  vectorInteractorToStager(vector: VectorData) {
    return vector;
  }
  vectorInteractorToStager$(vector: VectorData) {
    return of(vector);
  }
  vectorStagerToInteractor(vector: VectorData) {
    return vector;
  }
  vectorStagerToInteractor$(vector: VectorData) {
    return of(vector);
  }

  // rect
  private _rectWindowToInterface({
    rect,
    x,
    y,
  }: {
    rect: RectData;
    x: number;
    y: number;
  }) {
    return new Rect({
      x: rect.x - x,
      y: rect.y - y,
      width: rect.width,
      height: rect.height,
    });
  }
  rectWindowToInterface(rect: RectData) {
    return this._rectWindowToInterface({
      rect,
      x: this.x,
      y: this.y,
    });
  }
  rectWindowToInterface$(rect: RectData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._rectWindowToInterface({
          rect,
          x,
          y,
        });
      })
    );
  }
  private _rectInterfaceToWindow({
    rect,
    x,
    y,
  }: {
    rect: RectData;
    x: number;
    y: number;
  }) {
    return new Rect({
      x: rect.x + x,
      y: rect.y + y,
      width: rect.width,
      height: rect.height,
    });
  }
  rectInterfaceToWindow(rect: RectData) {
    return this._rectInterfaceToWindow({
      rect,
      x: this.x,
      y: this.y,
    });
  }
  rectInterfaceToWindow$(rect: RectData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._rectInterfaceToWindow({
          rect,
          x,
          y,
        });
      })
    );
  }
  private _rectInteractorToStager({
    rect,
    stagerRect,
  }: {
    rect: RectData;
    stagerRect: RectData;
  }) {
    return new Rect({
      x: rect.x - stagerRect.x,
      y: rect.y - stagerRect.y,
      width: rect.width,
      height: rect.height,
    });
  }
  rectInteractorToStager(rect: RectData) {
    return this._rectInteractorToStager({
      rect,
      stagerRect: this.stagerWindowRect,
    });
  }
  rectInteractorToStager$(rect: RectData) {
    return this.stagerWindowRect$.pipe(
      map((stagerRect) => {
        return this._rectInteractorToStager({
          rect,
          stagerRect,
        });
      })
    );
  }
  private _rectStagerToInteractor({
    rect,
    stagerRect,
  }: {
    rect: RectData;
    stagerRect: RectData;
  }) {
    return new Rect({
      x: rect.x + stagerRect.x,
      y: rect.y + stagerRect.y,
      width: rect.width,
      height: rect.height,
    });
  }
  rectStagerToInteractor(rect: RectData) {
    return this._rectStagerToInteractor({
      rect,
      stagerRect: this.stagerWindowRect,
    });
  }
  rectStagerToInteractor$(rect: RectData) {
    return this.stagerWindowRect$.pipe(
      map((stagerRect) => {
        return this._rectStagerToInteractor({
          rect,
          stagerRect,
        });
      })
    );
  }

  // bounding rect
  interfaceRect(element: HTMLElement) {
    const windowRect = this.windowRect(element);
    return this.rectWindowToInterface(windowRect);
  }
  windowRect(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return new Rect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }

  setStagerRect(stagerRect: RectData) {
    this._stagerWindowRect$.next(stagerRect);
  }

  // New method: smoothZoomAnimation using linear interpolation (lerp)
  private smoothZoomAnimation() {
    const zoomDampingFactor = 0.3; // smoothing constant
    const threshold = 0.001;
    const viewport = this.interactor.stage.viewport;
    const currentScale = viewport.scale;
    if (this.targetScale === null || this.zoomOrigin === null) return;
    const scaleDelta = (this.targetScale - currentScale) * zoomDampingFactor;
    // If change is minimal, finish the animation.
    if (Math.abs(scaleDelta) < threshold) {
      viewport.scaleBy(this.targetScale - currentScale, this.zoomOrigin);
      this.zoomAnimationFrameId = null;
      return;
    }
    viewport.scaleBy(scaleDelta, this.zoomOrigin);
    this.zoomAnimationFrameId = requestAnimationFrame(() =>
      this.smoothZoomAnimation()
    );
  }

  // New method: smoothPanAnimation using lerp
  private smoothPanAnimation() {
    const panDampingFactor = 0.2;
    const threshold = 0.1;
    const viewport = this.interactor.stage.viewport;
    const deltaX = this.remainingPanDelta.x * panDampingFactor;
    const deltaY = this.remainingPanDelta.y * panDampingFactor;
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
      viewport.panBy(this.remainingPanDelta.x, this.remainingPanDelta.y);
      this.remainingPanDelta = { x: 0, y: 0 };
      this.panAnimationFrameId = null;
      return;
    }
    viewport.panBy(deltaX, deltaY);
    this.remainingPanDelta.x -= deltaX;
    this.remainingPanDelta.y -= deltaY;
    this.panAnimationFrameId = requestAnimationFrame(() =>
      this.smoothPanAnimation()
    );
  }

  // event
  handleWheel(e: WheelEvent) {
    let deltaX = e.deltaX;
    let deltaY = e.deltaY;
    // Mouse wheel event detection logic
    if (Math.abs(e.deltaY) === Math.abs(this.lastDeltaY) || e.deltaMode === 1) {
      // Likely a mouse wheel
      deltaX = Math.sign(deltaX) * Math.min(Math.abs(deltaX), MAX_WHEEL_DELTA);
      deltaY = Math.sign(deltaY) * Math.min(Math.abs(deltaY), MAX_WHEEL_DELTA);
    }
    this.lastDeltaY = e.deltaY;
    const viewport = this.interactor.stage.viewport;
    const currentScale = viewport.scale;
    const scaleFactor = -deltaY * 0.015 * Math.min(currentScale, 1);
    if (e.ctrlKey) {
      const originInInteractor = { x: e.clientX, y: e.clientY };
      const originInStager = this.interactorToStager(originInInteractor);
      const originInViewport =
        this.interactor.stage.viewport.windowToViewport(originInStager);
      // Update target scale instead of applying immediately
      this.targetScale = currentScale + scaleFactor;
      this.zoomOrigin = originInViewport;
      if (this.zoomAnimationFrameId === null) {
        this.zoomAnimationFrameId = requestAnimationFrame(() =>
          this.smoothZoomAnimation()
        );
      }
    } else {
      // Apply smooth panning
      this.remainingPanDelta.x += -deltaX;
      this.remainingPanDelta.y += -deltaY;
      if (this.panAnimationFrameId === null) {
        this.panAnimationFrameId = requestAnimationFrame(() =>
          this.smoothPanAnimation()
        );
      }
    }
  }
}
