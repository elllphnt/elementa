import {
  combineLatestOrEmpty,
  pairwiseOrEmpty,
} from "@elllphnt/elementa-lang-utils";
import type { VectorData } from "@elllphnt/elementa-math-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { Interaction } from "./interaction.js";

export class MouseInteraction extends Interaction<"start" | "stop"> {
  private _window$ = new BehaviorSubject<Window | undefined>(undefined);
  private _running$ = new BehaviorSubject(false);

  private _shiftKey$ = new BehaviorSubject(false);
  private _altKey$ = new BehaviorSubject(false);
  private _ctrlKey$ = new BehaviorSubject(false);

  get window$() {
    return this._window$.asObservable();
  }
  get window() {
    return this._window$.value;
  }

  get running$() {
    return this._running$.asObservable().pipe(distinctUntilChanged());
  }
  get running() {
    return this._running$.value;
  }

  get shiftKey$() {
    return this._shiftKey$.asObservable().pipe(distinctUntilChanged());
  }
  get shiftKey() {
    return this._shiftKey$.value;
  }

  get altKey$() {
    return this._altKey$.asObservable().pipe(distinctUntilChanged());
  }
  get altKey() {
    return this._altKey$.value;
  }

  get ctrlKey$() {
    return this._ctrlKey$.asObservable().pipe(distinctUntilChanged());
  }
  get ctrlKey() {
    return this._ctrlKey$.value;
  }

  private _startPosition$ = new BehaviorSubject<VectorData>({
    x: 0,
    y: 0,
  });
  private _endPosition$ = new BehaviorSubject<VectorData>({
    x: 0,
    y: 0,
  });

  get startPosition$() {
    return this._startPosition$.asObservable();
  }
  get startPosition() {
    return this._startPosition$.value;
  }

  get endPosition$() {
    return this._endPosition$.asObservable();
  }
  get endPosition() {
    return this._endPosition$.value;
  }

  get deltaPosition$() {
    return combineLatestOrEmpty([this.startPosition$, this.endPosition$]).pipe(
      map(([start, end]) => ({
        x: end.x - start.x,
        y: end.y - start.y,
      }))
    );
  }
  get deltaPosition() {
    return {
      x: this.endPosition.x - this.startPosition.x,
      y: this.endPosition.y - this.startPosition.y,
    };
  }

  get rect$() {
    return combineLatestOrEmpty([this.startPosition$, this.endPosition$]).pipe(
      map(([start, end]) => ({
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y),
      }))
    );
  }
  get rect() {
    const start = this.startPosition;
    const end = this.endPosition;
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }

  constructor() {
    super();

    const windowSubscription = this.window$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev) {
          prev.removeEventListener("mousemove", this._handleMouseMove);
          prev.removeEventListener("mouseup", this._handleMouseUp);
        }
        if (next) {
          next.addEventListener("mousemove", this._handleMouseMove);
          next.addEventListener("mouseup", this._handleMouseUp);
        }
      });

    const runningSubscription = this.running$.subscribe((running) => {
      if (running) {
        this._eventTarget.dispatchEvent(new Event("start"));
      } else {
        this._eventTarget.dispatchEvent(new Event("stop"));
      }
    });

    this.addDisposer(() => {
      this._window$.complete();
      this._running$.complete();
      this._startPosition$.complete();
      this._endPosition$.complete();

      windowSubscription.unsubscribe();
      runningSubscription.unsubscribe();
    });
  }

  private _handleMouseMove = (e: MouseEvent) => {
    if (!e.movementX && !e.movementY) return;
    if (!this.running) {
      this._running$.next(true);
    }

    this._shiftKey$.next(e.shiftKey);
    this._altKey$.next(e.altKey);
    this._ctrlKey$.next(e.ctrlKey);
    this._endPosition$.next({ x: e.clientX, y: e.clientY });
  };
  private _handleMouseUp = () => {
    this._running$.next(false);
    this.stop();
    this.dispose();
  };

  run(window: Window, start: VectorData) {
    this._window$.next(window);
    this._startPosition$.next(start);
    this._endPosition$.next(start);
  }
  stop() {
    this._running$.next(false);
    this._window$.next(undefined);
  }
}
