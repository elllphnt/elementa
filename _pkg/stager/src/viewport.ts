import {
  Disposable,
  PointData,
  Rect,
  RectData,
  VectorData,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";

const DEFAULT_SCALE_MIN = 0.04;
const DEFAULT_SCALE_MAX = 500;

export type ViewportData = {
  pan: PointData;
  scale: number;
};

export class Viewport extends Disposable {
  readonly scaleMin: number;
  readonly scaleMax: number;

  private _initialized$ = new BehaviorSubject<boolean>(false);
  private _position$ = new BehaviorSubject<PointData>({ x: 0, y: 0 });
  private _size$ = new BehaviorSubject<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  private _pan$ = new BehaviorSubject<PointData>({ x: 0, y: 0 });
  private _scale$ = new BehaviorSubject<number>(1);
  private _initialContentOrigin$ = new BehaviorSubject<PointData>({
    x: 0,
    y: 0,
  });
  private _contentVisible$ = new BehaviorSubject<boolean>(true);

  get initialized() {
    return this._initialized$.value;
  }
  get initialized$() {
    return this._initialized$.asObservable();
  }

  get contentVisible() {
    return this._contentVisible$.value;
  }
  get contentVisible$() {
    return this._contentVisible$.asObservable().pipe(distinctUntilChanged());
  }

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

  get pan() {
    return this._pan$.value;
  }
  get pan$() {
    return this._pan$
      .asObservable()
      .pipe(distinctUntilChanged((a, b) => a.x === b.x && a.y === b.y));
  }

  get scale() {
    return this._scale$.value;
  }
  get scale$() {
    return this._scale$.asObservable().pipe(distinctUntilChanged());
  }

  get initialContentOrigin() {
    return this._initialContentOrigin$.value;
  }
  get initialContentOrigin$() {
    return this._initialContentOrigin$
      .asObservable()
      .pipe(distinctUntilChanged((a, b) => a.x === b.x && a.y === b.y));
  }

  get contentOrigin() {
    return {
      x: this.initialContentOrigin.x + this.pan.x,
      y: this.initialContentOrigin.y + this.pan.y,
    };
  }
  get contentOrigin$() {
    return combineLatestOrEmpty([this.initialContentOrigin$, this.pan$]).pipe(
      map(([initialContentOrigin, pan]) => ({
        x: initialContentOrigin.x + pan.x,
        y: initialContentOrigin.y + pan.y,
      }))
    );
  }

  get data(): ViewportData {
    return {
      pan: this.pan,
      scale: this.scale,
    };
  }
  get data$() {
    return combineLatestOrEmpty([this.pan$, this.scale$]).pipe(
      debounceTime(500),
      map(([pan, scale]) => ({
        pan,
        scale,
      }))
    );
  }

  get rect() {
    return new Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    });
  }

  // nearest pixel
  private _nearestPixel({
    point,
    scale,
    contentOrigin,
  }: {
    point: PointData;
    scale: number;
    contentOrigin: PointData;
  }) {
    const p0 = {
      x: contentOrigin.x % scale,
      y: contentOrigin.y % scale,
    }; // first pixel in viewport
    return {
      x: p0.x + Math.round((point.x - p0.x) / scale) * scale,
      y: p0.y + Math.round((point.y - p0.y) / scale) * scale,
    };
  }
  nearestPixel(point: PointData) {
    return this._nearestPixel({
      point,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  nearestPixel$(point: PointData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._nearestPixel({
          point,
          scale,
          contentOrigin,
        });
      })
    );
  }

  // nearest half pixel
  private _nearestHalfPixel({
    point,
    scale,
    contentOrigin,
  }: {
    point: PointData;
    scale: number;
    contentOrigin: PointData;
  }) {
    const p0 = {
      x: contentOrigin.x % scale,
      y: contentOrigin.y % scale,
    }; // first pixel in viewport
    return {
      x: p0.x + Math.round((2 * (point.x - p0.x)) / scale) * scale * 0.5,
      y: p0.y + Math.round((2 * (point.y - p0.y)) / scale) * scale * 0.5,
    };
  }
  nearestHalfPixel(point: PointData) {
    return this._nearestHalfPixel({
      point,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  nearestHalfPixel$(point: PointData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._nearestHalfPixel({
          point,
          scale,
          contentOrigin,
        });
      })
    );
  }

  // round to pixel
  private _roundToPixel({ value, scale }: { value: number; scale: number }) {
    return Math.round(value / scale) * scale;
  }
  roundToPixel(value: number) {
    return this._roundToPixel({
      value,
      scale: this.scale,
    });
  }
  roundToPixel$(value: number) {
    return this.scale$.pipe(
      map((scale) => {
        return this._roundToPixel({
          value,
          scale,
        });
      })
    );
  }

  // rect nearest pixel
  private _rectNearestPixel({
    rect,
    scale,
    contentOrigin,
  }: {
    rect: RectData;
    scale: number;
    contentOrigin: PointData;
  }) {
    const p0 = {
      x: contentOrigin.x % scale,
      y: contentOrigin.y % scale,
    }; // first pixel in viewport

    const topLeft = {
      x: p0.x + Math.round((rect.x - p0.x) / scale) * scale,
      y: p0.y + Math.round((rect.y - p0.y) / scale) * scale,
    };
    const bottomRight = {
      x: p0.x + Math.round((rect.x + rect.width - p0.x) / scale) * scale,
      y: p0.y + Math.round((rect.y + rect.height - p0.y) / scale) * scale,
    };

    return new Rect({
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    });
  }
  rectNearestPixel(rect: RectData) {
    return this._rectNearestPixel({
      rect,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  rectNearestPixel$(rect: RectData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._rectNearestPixel({
          rect,
          scale,
          contentOrigin,
        });
      })
    );
  }

  // rect nearest half pixel
  private _rectNearestHalfPixel({
    rect,
    scale,
    contentOrigin,
  }: {
    rect: RectData;
    scale: number;
    contentOrigin: PointData;
  }) {
    const p0 = {
      x: contentOrigin.x % scale,
      y: contentOrigin.y % scale,
    }; // first pixel in viewport

    const topLeft = {
      x: p0.x + Math.round((2 * (rect.x - p0.x)) / scale) * scale * 0.5,
      y: p0.y + Math.round((2 * (rect.y - p0.y)) / scale) * scale * 0.5,
    };
    // const bottomRight = {
    //   x:
    //     p0.x +
    //     Math.round((2 * (rect.x + rect.width - p0.x)) / scale) * scale * 0.5,
    //   y:
    //     p0.y +
    //     Math.round((2 * (rect.y + rect.height - p0.y)) / scale) * scale * 0.5,
    // };

    const width = Math.round((2 * rect.width) / scale) * scale * 0.5;
    const height = Math.round((2 * rect.height) / scale) * scale * 0.5;

    return new Rect({
      x: topLeft.x,
      y: topLeft.y,
      width,
      height,
    });
  }
  rectNearestHalfPixel(rect: RectData) {
    return this._rectNearestHalfPixel({
      rect,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  // used
  rectNearestHalfPixel$(rect: RectData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._rectNearestHalfPixel({
          rect,
          scale,
          contentOrigin,
        });
      })
    );
  }

  constructor() {
    super();
    this.scaleMin = DEFAULT_SCALE_MIN;
    this.scaleMax = DEFAULT_SCALE_MAX;

    this.addDisposer(() => {
      this._contentVisible$.complete();
      this._position$.complete();
      this._size$.complete();
      this._initialContentOrigin$.complete();
      this._pan$.complete();
      this._scale$.complete();
    });
  }

  private _setPan(pan: PointData) {
    this._pan$.next(pan);
  }
  private _setScale(scale: number) {
    this._scale$.next(scale);
  }

  setSize(width: number, height: number) {
    this._size$.next({ width, height });
  }
  setPosition(x: number, y: number) {
    this._position$.next({ x, y });
  }
  setContentVisible(visible: boolean) {
    this._contentVisible$.next(visible);
  }

  scaleTo(scale: number) {
    this.scaleBy(scale - this.scale, {
      x: this.width / 2,
      y: this.height / 2,
    });
  }
  scaleBy(deltaScale: number, origin: { x: number; y: number }) {
    const scaleMin = this.scaleMin;
    const scaleMax = this.scaleMax;
    const oldScale = this.scale;
    const contentOrigin = this.contentOrigin;
    const oldPan = this.pan;

    const newScale = Math.max(
      scaleMin,
      Math.min(scaleMax, oldScale + deltaScale)
    );

    if (newScale === oldScale) {
      return;
    }

    const _deltaZ = newScale - oldScale;
    const newPan = {
      x: oldPan.x + ((contentOrigin.x - origin.x) * _deltaZ) / oldScale,
      y: oldPan.y + ((contentOrigin.y - origin.y) * _deltaZ) / oldScale,
    };

    this._setScale(newScale);
    this._setPan(newPan);
  }
  panTo(pan: { x: number; y: number }) {
    this._setPan(pan);
  }
  panBy(deltaX: number, deltaY: number) {
    this._setPan({
      x: this.pan.x + deltaX,
      y: this.pan.y + deltaY,
    });
  }

  // content
  setInitialContentOrigin(origin: PointData) {
    this._initialContentOrigin$.next(origin);
  }

  // point
  private _windowToViewport({
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
  windowToViewport(point: PointData) {
    return this._windowToViewport({
      point,
      x: this.x,
      y: this.y,
    });
  }
  windowToViewport$(point: PointData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._windowToViewport({
          point,
          x,
          y,
        });
      })
    );
  }
  private _viewportToWindow({
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
  viewportToWindow(point: PointData) {
    return this._viewportToWindow({
      point,
      x: this.x,
      y: this.y,
    });
  }
  viewportToWindow$(point: PointData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._viewportToWindow({
          point,
          x,
          y,
        });
      })
    );
  }
  private _viewportToContent({
    point,
    scale,
    contentOrigin,
  }: {
    point: PointData;
    scale: number;
    contentOrigin: PointData;
  }) {
    return {
      x: (point.x - contentOrigin.x) / scale,
      y: (point.y - contentOrigin.y) / scale,
    };
  }
  viewportToContent(point: PointData) {
    return this._viewportToContent({
      point,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  viewportToContent$(point: PointData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._viewportToContent({
          point,
          scale,
          contentOrigin,
        });
      })
    );
  }
  private _contentToViewport({
    point,
    scale,
    contentOrigin,
  }: {
    point: PointData;
    scale: number;
    contentOrigin: PointData;
  }) {
    return {
      x: point.x * scale + contentOrigin.x,
      y: point.y * scale + contentOrigin.y,
    };
  }
  contentToViewport(point: PointData) {
    return this._contentToViewport({
      point,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  // used
  contentToViewport$(point: PointData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._contentToViewport({
          point,
          scale,
          contentOrigin,
        });
      })
    );
  }
  windowToContent(point: PointData) {
    const viewportPoint = this.windowToViewport(point);
    return this.viewportToContent(viewportPoint);
  }
  windowToContent$(point: PointData) {
    return this.windowToViewport$(point).pipe(
      switchMap((viewportPoint) => this.viewportToContent$(viewportPoint))
    );
  }
  contentToWindow(point: PointData) {
    const viewportPoint = this.contentToViewport(point);
    return this.viewportToWindow(viewportPoint);
  }

  // vectordata
  vectorWindowToViewport(vector: VectorData) {
    return vector;
  }
  vectorWindowToViewport$(vector: VectorData) {
    return of(vector);
  }
  vectorViewportToWindow(vector: VectorData) {
    return vector;
  }
  vectorViewportToWindow$(vector: VectorData) {
    return of(vector);
  }
  private _vectorViewportToContent({
    vector,
    scale,
  }: {
    vector: VectorData;
    scale: number;
  }) {
    return {
      x: vector.x / scale,
      y: vector.y / scale,
    };
  }
  vectorViewportToContent(vector: VectorData) {
    return this._vectorViewportToContent({
      vector,
      scale: this.scale,
    });
  }
  vectorViewportToContent$(vector: VectorData) {
    return this.scale$.pipe(
      map((scale) => {
        return this._vectorViewportToContent({
          vector,
          scale,
        });
      })
    );
  }
  private _vectorContentToViewport({
    vector,
    scale,
  }: {
    vector: VectorData;
    scale: number;
  }) {
    return {
      x: vector.x * scale,
      y: vector.y * scale,
    };
  }
  vectorContentToViewport(vector: VectorData) {
    return this._vectorContentToViewport({
      vector,
      scale: this.scale,
    });
  }
  vectorContentToViewport$(vector: VectorData) {
    return this.scale$.pipe(
      map((scale) => {
        return this._vectorContentToViewport({
          vector,
          scale,
        });
      })
    );
  }
  vectorWindowToContent(vector: VectorData) {
    const viewportVector = this.vectorWindowToViewport(vector);
    return this.vectorViewportToContent(viewportVector);
  }
  vectorWindowToContent$(vector: VectorData) {
    return this.vectorWindowToViewport$(vector).pipe(
      switchMap((viewportVector) =>
        this.vectorViewportToContent$(viewportVector)
      )
    );
  }
  vectorContentToWindow(vector: VectorData) {
    const viewportVector = this.vectorContentToViewport(vector);
    return this.vectorViewportToWindow(viewportVector);
  }
  vectorContentToWindow$(vector: VectorData) {
    return this.vectorContentToViewport$(vector).pipe(
      switchMap((viewportVector) =>
        this.vectorViewportToWindow$(viewportVector)
      )
    );
  }

  // rect
  private _rectWindowToViewport({
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
  rectWindowToViewport(rect: RectData) {
    return this._rectWindowToViewport({
      rect,
      x: this.x,
      y: this.y,
    });
  }
  rectWindowToViewport$(rect: RectData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._rectWindowToViewport({
          rect,
          x,
          y,
        });
      })
    );
  }
  private _rectViewportToWindow({
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
  rectViewportToWindow(rect: RectData) {
    return this._rectViewportToWindow({
      rect,
      x: this.x,
      y: this.y,
    });
  }
  rectViewportToWindow$(rect: RectData) {
    return combineLatestOrEmpty([this.x$, this.y$]).pipe(
      map(([x, y]) => {
        return this._rectViewportToWindow({
          rect,
          x,
          y,
        });
      })
    );
  }
  private _rectViewportToContent({
    rect,
    scale,
    contentOrigin,
  }: {
    rect: RectData;
    scale: number;
    contentOrigin: PointData;
  }) {
    const _rect = new Rect({
      x: (rect.x - contentOrigin.x) / scale,
      y: (rect.y - contentOrigin.y) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    });
    return _rect;
  }
  rectViewportToContent(rect: RectData) {
    return this._rectViewportToContent({
      rect,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  rectViewportToContent$(rect: RectData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._rectViewportToContent({
          rect,
          scale,
          contentOrigin,
        });
      })
    );
  }
  private _rectContentToViewport({
    rect,
    scale,
    contentOrigin,
  }: {
    rect: RectData;
    scale: number;
    contentOrigin: PointData;
  }) {
    return new Rect({
      x: rect.x * scale + contentOrigin.x,
      y: rect.y * scale + contentOrigin.y,
      width: rect.width * scale,
      height: rect.height * scale,
    });
  }
  rectContentToViewport(rect: RectData) {
    return this._rectContentToViewport({
      rect,
      scale: this.scale,
      contentOrigin: this.contentOrigin,
    });
  }
  // used
  rectContentToViewport$(rect: RectData) {
    return combineLatestOrEmpty([this.scale$, this.contentOrigin$]).pipe(
      map(([scale, contentOrigin]) => {
        return this._rectContentToViewport({
          rect,
          scale,
          contentOrigin,
        });
      })
    );
  }
  rectWindowToContent(rect: RectData) {
    const viewportRect = this.rectWindowToViewport(rect);
    return this.rectViewportToContent(viewportRect);
  }
  rectWindowToContent$(rect: RectData) {
    return this.rectWindowToViewport$(rect).pipe(
      switchMap((viewportRect) => this.rectViewportToContent$(viewportRect))
    );
  }
  rectContentToWindow(rect: RectData) {
    const viewportRect = this.rectContentToViewport(rect);
    return this.rectViewportToWindow(viewportRect);
  }
  rectContentToWindow$(rect: RectData) {
    return this.rectContentToViewport$(rect).pipe(
      switchMap((viewportRect) => this.rectViewportToWindow$(viewportRect))
    );
  }

  // bounding rect
  contentRect(element: HTMLElement) {
    const viewportRect = this.viewportRect(element);
    const contentRect = this.rectViewportToContent(viewportRect);
    return contentRect;
  }
  viewportRect(element: HTMLElement) {
    const windowRect = this.windowRect(element);
    return this.rectWindowToViewport(windowRect);
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

  staticWindowRect(element: HTMLElement) {
    const contentRect = this.staticContentRect(element);
    return this.rectContentToWindow(contentRect);
  }
  staticViewportRect(element: HTMLElement) {
    const contentRect = this.staticContentRect(element);
    return this.rectContentToViewport(contentRect);
  }
  staticContentRect(element: HTMLElement) {
    const rect = this.contentRect(element);
    const style = getComputedStyle(element);
    const transformLessRect = (() => {
      const tx = style.transform;

      if (tx) {
        let sx, sy, dx, dy;
        if (tx.startsWith("matrix3d(")) {
          const ta = tx.slice(9, -1).split(/, /);
          sx = +ta[0];
          sy = +ta[5];
          dx = +ta[12];
          dy = +ta[13];
        } else if (tx.startsWith("matrix(")) {
          const ta = tx.slice(7, -1).split(/, /);
          sx = +ta[0];
          sy = +ta[3];
          dx = +ta[4];
          dy = +ta[5];
        } else {
          return rect;
        }

        const to = style.transformOrigin;
        const x = rect.x - dx - (1 - sx) * parseFloat(to);
        const y =
          rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(" ") + 1));
        const w = sx ? rect.width / sx : element.offsetWidth;
        const h = sy ? rect.height / sy : element.offsetHeight;
        return {
          x: x,
          y: y,
          width: w,
          height: h,
          top: y,
          right: x + w,
          bottom: y + h,
          left: x,
        };
      } else {
        return rect;
      }
    })();

    if (style.position === "relative") {
      if (style.left) {
        transformLessRect.x -= parseFloat(style.left);
      } else if (style.right) {
        transformLessRect.x += parseFloat(style.right);
      }
      if (style.top) {
        transformLessRect.y -= parseFloat(style.top);
      } else if (style.bottom) {
        transformLessRect.y += parseFloat(style.bottom);
      }
    }

    return new Rect(transformLessRect);
  }

  fitContentRect(contentRect: RectData, viewportRect?: RectData) {
    const cRect = new Rect(contentRect);
    const vRect = viewportRect ? new Rect(viewportRect) : this.rect;
    const cAspR = cRect.aspectRatio;
    const vAspR = vRect.aspectRatio;
    const cCntr = cRect.center;
    const vCntr = vRect.center;
    const o = this.initialContentOrigin;

    if (
      cRect.width === 0 ||
      cRect.height === 0 ||
      vRect.width === 0 ||
      vRect.height === 0
    ) {
      return;
    }

    let scale: number;

    if (cAspR > vAspR) {
      scale = vRect.width / cRect.width;
    } else {
      scale = vRect.height / cRect.height;
    }

    const pan = {
      x: vCntr.x - cCntr.x * scale - o.x,
      y: vCntr.y - cCntr.y * scale - o.y,
    };

    this._setScale(scale);
    this._setPan(pan);
  }

  initialize() {
    this._initialized$.next(true);
  }

  restore(data: ViewportData): void {
    if (data.pan) {
      this._setPan(data.pan);
    }
    if (data.scale) {
      this._setScale(data.scale);
    }
  }
}
