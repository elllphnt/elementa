import _ from "lodash";
import { BehaviorSubject, Observable, map } from "rxjs";
import { IconData } from "../_types";

export class IconStore {
  private _icons$ = new BehaviorSubject<Record<string, IconData>>({});

  icon(id: string) {
    return this._icons$.value[id] as IconData | undefined;
  }
  icon$(id: string) {
    return this._icons$.pipe(map((icons) => icons[id])) as Observable<
      IconData | undefined
    >;
  }

  loadIcons(...icons: IconData[]) {
    const newIcons = { ...this._icons$.value };
    icons.forEach((p) => (newIcons[p.name] = p));
    this._icons$.next(newIcons);
  }
  unloadIcons(...iconIds: string[]) {
    const newIcons = _.omit(this._icons$.value, iconIds);
    this._icons$.next(newIcons);
  }
  unloadAllIcons() {
    this._icons$.next({});
  }
}
