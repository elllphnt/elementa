import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";
import { IMarkerManager } from "../_types/_";
import { LineMarker, Marker, RectMarker } from "../primitives/markers";

export class MarkerManager extends Disposable implements IMarkerManager {
  private _markers$: BehaviorSubject<Marker[]>;

  get markers$() {
    return this._markers$.asObservable();
  }
  get markers() {
    return this._markers$.value;
  }

  constructor() {
    super();
    this._markers$ = new BehaviorSubject<Marker[]>([]);

    this.addDisposer(() => {
      this._markers$.complete();
    });
  }

  createLineMarker() {
    const marker = new LineMarker();
    this._markers$.next([...this.markers, marker]);
    return marker;
  }

  createRectMarker() {
    const marker = new RectMarker();
    this._markers$.next([...this.markers, marker]);
    return marker;
  }

  removeMarker(marker: Marker) {
    this._markers$.next(this.markers.filter((m) => m !== marker));
  }
}
