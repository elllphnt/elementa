import { diff } from "deep-object-diff";
import _ from "lodash";
import { BehaviorSubject, Observable, map } from "rxjs";

export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable };

export type SerializableStateData = Record<string, Serializable>;

export class SerializableState {
  private _data$ = new BehaviorSubject<SerializableStateData>({});

  get data$(): Observable<SerializableStateData> {
    return this._data$.asObservable();
  }
  get data(): SerializableStateData {
    return this._data$.getValue();
  }

  value<T>(key: _.PropertyPath): T | undefined;
  value<T>(key: _.PropertyPath, defaultValue: T): T;
  value<T>(key: _.PropertyPath, defaultValue?: T) {
    return _.get(this.data, key) ?? defaultValue;
  }
  value$<T>(key: _.PropertyPath): BehaviorSubject<T | undefined>;
  value$<T>(key: _.PropertyPath, defaultValue: T): BehaviorSubject<T>;
  value$<T>(key: _.PropertyPath, defaultValue?: T) {
    return this.data$.pipe(
      map((data) => _.get(data, key) as T | undefined),
      map((value) => value ?? defaultValue)
    );
  }

  set<T extends Serializable>(key: _.PropertyPath, value: T) {
    const newData = _.merge({}, this.data);
    _.set(newData, key, value);
    this._data$.next(newData);
  }

  restore(data: SerializableStateData) {
    const _diff = diff(this.data, data);
    this.restoreDiff(_diff);
  }
  restoreDiff(diff: any) {
    this._data$.next(_.merge({}, this.data, diff));
  }
}
