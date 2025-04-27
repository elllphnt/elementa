import { FrameWidgetData } from "@elllphnt/elementa-base";
import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map } from "rxjs";
import { Component } from "../../component";

export class FrameViewport extends Disposable {
  readonly component: Component;

  get project() {
    return this.component.project;
  }

  private _state$ = new BehaviorSubject<
    NonNullable<FrameWidgetData["viewport"]>
  >({
    overflow: "scroll-y",
  });

  get data() {
    return this._state$.value;
  }
  get data$() {
    return this._state$.asObservable();
  }

  get height() {
    return this.data.height;
  }
  get height$() {
    return this.data$.pipe(map((data) => data.height));
  }

  get width() {
    return this.data.width;
  }
  get width$() {
    return this.data$.pipe(map((data) => data.width));
  }

  get overflow() {
    return this.data.overflow;
  }
  get overflow$() {
    return this.data$.pipe(map((data) => data.overflow));
  }

  constructor({ component }: { component: Component }) {
    super();

    this.component = component;

    this.addDisposer(() => {
      this._state$.complete();
    });
  }

  private _updateState(data: Partial<FrameWidgetData["viewport"]>) {
    const nextState = { ...this.data, ...data };
    // ensure that if not set the overflow value of the frame defaults to scroll-y
    if (!nextState.overflow) {
      nextState.overflow = "scroll-y";
    }
    if (nextState.width) {
      nextState.width = Math.max(0, Math.round(nextState.width));
    }
    if (nextState.height) {
      nextState.height = Math.max(0, Math.round(nextState.height));
    }
    this._state$.next(nextState);
  }
  update(data: Partial<FrameWidgetData["viewport"]>) {
    this._updateState(data);
  }
  restore(data: NonNullable<FrameWidgetData["viewport"]>) {
    this._state$.next(data);
  }
}
