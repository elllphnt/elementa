import { WidgetData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { Entity } from "../entity";

export abstract class Widget<
  D extends WidgetData = WidgetData,
> extends Entity<D> {
  readonly type: string;

  private _x$: BehaviorSubject<number>;
  private _y$: BehaviorSubject<number>;
  private _scale$: BehaviorSubject<number>;

  get x() {
    return this._x$.value;
  }
  get x$() {
    return this._x$.asObservable();
  }

  get y() {
    return this._y$.value;
  }
  get y$() {
    return this._y$.asObservable();
  }

  get scale() {
    return this._scale$.value;
  }
  get scale$() {
    return this._scale$.asObservable();
  }

  get _data(): WidgetData {
    return {
      ...super._data,
      type: this.type,
      x: this.x,
      y: this.y,
    };
  }
  get _data$(): Observable<WidgetData> {
    return combineLatestOrEmpty([super._data$, this.x$, this.y$]).pipe(
      map(([data, x, y]) => ({
        ...data,
        type: this.type,
        x,
        y,
      })),
    );
  }

  constructor({
    id,
    type,
    component,
  }: {
    id?: string;
    type: string;
    component: Component;
  }) {
    super({
      id,
      component,
      type,
    });
    this.type = type;
    this._x$ = new BehaviorSubject<number>(0);
    this._y$ = new BehaviorSubject<number>(0);
    this._scale$ = new BehaviorSubject<number>(1);

    this.addDisposer(() => {
      this._x$.complete();
      this._y$.complete();
    });
  }

  setX(x: number) {
    this._x$.next(Math.round(x));
  }
  setY(y: number) {
    this._y$.next(Math.round(y));
  }
  setScale(scale: number) {
    this._scale$.next(scale);
  }

  remove(): void {
    this.component.removeWidget(this);
  }

  restore(data: D) {
    super.restore(data);
    this._x$.next(data.x ?? 0);
    this._y$.next(data.y ?? 0);
  }
}
