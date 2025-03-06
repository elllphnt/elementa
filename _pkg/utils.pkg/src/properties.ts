import _ from "lodash";
import { BehaviorSubject, map } from "rxjs";

export class PropertySet {
  private _properties$ = new BehaviorSubject<Record<string, any>>({});

  value<T>(key: _.PropertyPath): T | undefined;
  value<T>(key: _.PropertyPath, defaultValue: T): T;
  value<T>(key: _.PropertyPath, defaultValue?: T) {
    return _.get(this._properties$.value, key) ?? defaultValue;
  }
  value$<T>(key: _.PropertyPath): BehaviorSubject<T | undefined>;
  value$<T>(key: _.PropertyPath, defaultValue: T): BehaviorSubject<T>;
  value$<T>(key: _.PropertyPath, defaultValue?: T) {
    return this._properties$.pipe(
      map((data) => _.get(data, key) as T | undefined),
      map((value) => value ?? defaultValue),
    );
  }

  set(key: _.PropertyPath, value: any) {
    const newData = _.merge({}, this._properties$.value);
    _.set(newData, key, value);
    this._properties$.next(newData);
  }
}
