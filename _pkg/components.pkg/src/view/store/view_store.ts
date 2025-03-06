import _ from "lodash";
import { BehaviorSubject, Observable, map } from "rxjs";
import { View } from "../_types";

export class ViewStore {
  private _views$ = new BehaviorSubject<Record<string, View>>({});

  view(id: string) {
    return this._views$.value[id] as View | undefined;
  }
  view$(id: string) {
    return this._views$.pipe(map((views) => views[id])) as Observable<
      View | undefined
    >;
  }

  loadViews(...views: View[]) {
    const newViews = { ...this._views$.value };
    views.forEach((p) => (newViews[p.id] = p));
    this._views$.next(newViews);
  }
  unloadViews(...viewIds: string[]) {
    const newViews = _.omit(this._views$.value, viewIds);
    this._views$.next(newViews);
  }
  unloadAllViews() {
    this._views$.next({});
  }
}
