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
      viewport.scaleBy(scaleFactor, originInViewport);
    } else {
      viewport.panBy(-deltaX, -deltaY);
    }
  }
}
