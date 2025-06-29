import {
  AggregatedStateList,
  AggregatedStateRecord,
  ListState,
  RecordState,
  ValueState,
} from "@elllphnt/elementa-kernel";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ArrayKeyOf, ObjectKeyOf } from "../../../../utils/lang/build/types.js";
import { JsonListState } from "./list.js";
import { AggregatedJsonStateList } from "./state_list.js";
import { AggregatedJsonStateRecord } from "./state_record.js";
import { JsonValueState } from "./value.js";

export class JsonRecordState<
  T extends Record<string, unknown>
> extends RecordState<T> {
  private readonly subject$: BehaviorSubject<T>;
  private _subStates: Record<string, any> = {};

  constructor(init: T) {
    super();
    this.subject$ = new BehaviorSubject<T>({ ...init });

    this.addDisposer(() => {
      this.subject$.complete();
      // Dispose nested states
      Object.values(this._subStates).forEach((state) => state?.dispose?.());
    });
  }

  get record(): T {
    return this.subject$.value;
  }

  get record$(): Observable<T> {
    return this.subject$.asObservable();
  }

  entry<K extends keyof T>(key: K): T[K] {
    return this.subject$.value[key];
  }

  entry$<K extends keyof T>(key: K): Observable<T[K]> {
    return this.record$.pipe(map((v) => v[key]));
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const current = { ...this.subject$.value };
    current[key] = value;
    this.subject$.next(current);
  }

  remove<K extends keyof T>(key: K): T[K] | undefined {
    const current = { ...this.subject$.value };
    const value = current[key];
    delete current[key];
    this.subject$.next(current);
    return value;
  }

  setAll(data: Partial<T>): void {
    const current = { ...this.subject$.value };
    Object.assign(current, data);
    this.subject$.next(current);
  }

  removeAll(keys: (keyof T)[]): void {
    const current = { ...this.subject$.value };
    keys.forEach((key) => delete current[key]);
    this.subject$.next(current);
  }

  setRecord(data: T): void {
    this.subject$.next({ ...data });
  }

  getRecordState<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<NonNullable<T[K]>> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string];
    }

    const nestedState = new JsonRecordState({} as NonNullable<T[K]>);
    this._subStates[key as string] = nestedState;
    return nestedState;
  }

  getListState<K extends ArrayKeyOf<Required<T>>>(key: K) {
    if (this._subStates[key as string]) {
      return this._subStates[key as string];
    }

    const nestedState = new JsonListState([]) as ListState<any>;
    this._subStates[key as string] = nestedState;
    return nestedState;
  }

  getAggregatedStateRecord<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): AggregatedStateRecord<RecordState<any>> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string];
    }

    const nestedState = new AggregatedJsonStateRecord(
      {},
      () => new JsonRecordState({}) as RecordState<any>
    );
    this._subStates[key as string] = nestedState;
    return nestedState;
  }

  getAggregatedStateList<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): AggregatedStateList<RecordState<any>> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string];
    }

    const nestedState = new AggregatedJsonStateList(
      [],
      () => new JsonRecordState({}) as RecordState<any>
    );
    this._subStates[key as string] = nestedState;
    return nestedState;
  }

  getValueState<K extends keyof T>(key: K): ValueState<T[K]> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string];
    }

    const currentValue = this.subject$.value[key];
    const nestedState = new JsonValueState<T[K]>(currentValue);
    this._subStates[key as string] = nestedState;
    return nestedState;
  }
}
