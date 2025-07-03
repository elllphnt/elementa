import { BehaviorSubject } from "rxjs";

export const markerTypes = {
  rect: "rect",
  line: "line",
};

export abstract class Marker {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${Marker.keySeed}-${Marker.key++}`;
  type: string;

  constructor({ type }: { type: string }) {
    this.type = type;
  }
}

export class RectMarker extends Marker {
  private _x$ = new BehaviorSubject<number>(0);
  private _y$ = new BehaviorSubject<number>(0);
  private _width$ = new BehaviorSubject<number>(0);
  private _height$ = new BehaviorSubject<number>(0);
  private _borderColor$ = new BehaviorSubject<string>("#08f");
  private _borderWidth$ = new BehaviorSubject<number>(1);
  private _borderStyle$ = new BehaviorSubject<"solid" | "dashed" | "dotted">(
    "solid"
  );
  private _fillColor$ = new BehaviorSubject<string>("transparent");

  get x$() {
    return this._x$.asObservable();
  }
  get x() {
    return this._x$.value;
  }

  get y$() {
    return this._y$.asObservable();
  }
  get y() {
    return this._y$.value;
  }

  get width$() {
    return this._width$.asObservable();
  }
  get width() {
    return this._width$.value;
  }

  get height$() {
    return this._height$.asObservable();
  }
  get height() {
    return this._height$.value;
  }

  get borderColor$() {
    return this._borderColor$.asObservable();
  }
  get borderColor() {
    return this._borderColor$.value;
  }

  get borderWidth$() {
    return this._borderWidth$.asObservable();
  }
  get borderWidth() {
    return this._borderWidth$.value;
  }

  get borderStyle$() {
    return this._borderStyle$.asObservable();
  }
  get borderStyle() {
    return this._borderStyle$.value;
  }

  get fillColor$() {
    return this._fillColor$.asObservable();
  }
  get fillColor() {
    return this._fillColor$.value;
  }

  constructor() {
    super({ type: "rect" });
  }

  update({
    x,
    y,
    width,
    height,
    borderColor,
    borderWidth,
    borderStyle,
    fillColor,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: "solid" | "dashed" | "dotted";
    fillColor?: string;
  }) {
    if (x !== undefined) {
      this._x$.next(x);
    }
    if (y !== undefined) {
      this._y$.next(y);
    }
    if (width !== undefined) {
      this._width$.next(width);
    }
    if (height !== undefined) {
      this._height$.next(height);
    }
    if (borderColor !== undefined) {
      this._borderColor$.next(borderColor);
    }
    if (borderWidth !== undefined) {
      this._borderWidth$.next(borderWidth);
    }
    if (borderStyle !== undefined) {
      this._borderStyle$.next(borderStyle);
    }
    if (fillColor !== undefined) {
      this._fillColor$.next(fillColor);
    }
  }
}

export class LineMarker extends Marker {
  private _x$ = new BehaviorSubject<number>(0);
  private _y$ = new BehaviorSubject<number>(0);
  private _start$ = new BehaviorSubject<number>(0);
  private _end$ = new BehaviorSubject<number>(0);
  private _color$ = new BehaviorSubject<string>("#08f");
  private _width$ = new BehaviorSubject<number>(0);

  get x$() {
    return this._x$.asObservable();
  }
  get x() {
    return this._x$.value;
  }

  get y$() {
    return this._y$.asObservable();
  }
  get y() {
    return this._y$.value;
  }

  get start$() {
    return this._start$.asObservable();
  }
  get start() {
    return this._start$.value;
  }

  get end$() {
    return this._end$.asObservable();
  }
  get end() {
    return this._end$.value;
  }

  get color$() {
    return this._color$.asObservable();
  }
  get color() {
    return this._color$.value;
  }

  get width$() {
    return this._width$.asObservable();
  }
  get width() {
    return this._width$.value;
  }

  constructor() {
    super({
      type: markerTypes.line,
    });
  }

  update({
    x,
    y,
    start,
    end,
    color,
    width,
  }: {
    x?: number;
    y?: number;
    start?: number;
    end?: number;
    color?: string;
    width?: number;
  }) {
    if (x !== undefined) {
      this._x$.next(x);
    }
    if (y !== undefined) {
      this._y$.next(y);
    }
    if (start !== undefined) {
      this._start$.next(start);
    }
    if (end !== undefined) {
      this._end$.next(end);
    }
    if (color !== undefined) {
      this._color$.next(color);
    }
    if (width !== undefined) {
      this._width$.next(width);
    }
  }
}
