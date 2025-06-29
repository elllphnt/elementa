import { getOrCreateYArray, getOrCreateYMap } from "@elllphnt/crdt";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as y from "yjs";
import { ArrayKeyOf, ObjectKeyOf } from "../../../types/object.js";
import { ListState } from "../../list.js";
import { RecordState } from "../../record.js";
import { State } from "../../state.js";
import { AggregatedStateList } from "../../state_list.js";
import { AggregatedStateRecord } from "../../state_record.js";
import { ValueState } from "../../value.js";
import { CrdtListState } from "./list.js";
import { AggregatedCrdtStateList } from "./state_list.js";
import { AggregatedCrdtStateRecord } from "./state_record.js";
import { CrdtValueState } from "./value.js";

export class CrdtRecordState<
  T extends Record<string, unknown>
> extends RecordState<T> {
  private readonly map: y.Map<any>;
  private readonly subject$: BehaviorSubject<T>;

  private _subStates: Record<string, State> = {};

  constructor(map: y.Map<any>) {
    super();
    this.map = map;

    const initial: Record<string, any> = {};
    for (const [key, value] of map.entries()) {
      initial[key] = value;
    }

    this.subject$ = new BehaviorSubject(initial as T);

    this.observer = this.observer.bind(this);

    this.addInitializer(() => {
      this.map.observe(this.observer);
      this.addDisposer(() => {
        this.map.unobserve(this.observer);
      });
    });

    this.addDisposer(() => {
      for (const key in this._subStates) {
        this._subStates[key].dispose();
      }
      this.subject$.complete();
    });
  }

  private observer(event: y.YMapEvent<any>) {
    const current = { ...this.subject$.value };
    for (const [key, change] of event.changes.keys.entries()) {
      if (change.action === "add" || change.action === "update") {
        (current as any)[key] = this.map.get(key);
      } else if (change.action === "delete") {
        delete current[key];
      }
    }
    this.subject$.next(current as T);
  }

  get record(): T {
    return this.subject$.value;
  }

  get record$(): Observable<T> {
    return this.subject$.asObservable();
  }

  entry<K extends keyof T>(key: K): T[K] {
    return this.map.get(key as string);
  }

  entry$<K extends keyof T>(key: K): Observable<T[K]> {
    return this.record$.pipe(map((v) => v[key]));
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.map.set(key as string, value);
  }

  remove<K extends keyof T>(key: K): T[K] | undefined {
    const value = this.map.get(key as string);
    this.map.delete(key as string);
    return value;
  }

  setAll(data: Partial<T>): void {
    Object.entries(data).forEach(([k, v]) => {
      this.map.set(k, v);
    });
  }

  removeAll(keys: (keyof T)[]): void {
    keys.forEach((key) => this.map.delete(key as string));
  }

  setRecord(data: T): void {
    this.map.clear();
    Object.entries(data).forEach(([k, v]) => {
      this.map.set(k, v);
    });
  }

  getRecordState<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<NonNullable<T[K]>> {
    if (this._subStates[key as string]) {
      throw new Error(
        `Record state for key "${key as string}" already exists.`
      );
    }

    const nestedMap = getOrCreateYMap(this.map, key as string);
    const state = new CrdtRecordState(nestedMap) as RecordState<
      NonNullable<T[K]>
    >;
    this._subStates[key as string] = state;
    return state;
  }
  getListState<K extends ArrayKeyOf<Required<T>>>(key: K) {
    if (this._subStates[key as string]) {
      throw new Error(`List state for key "${key as string}" already exists.`);
    }

    const nestedArray = getOrCreateYArray(this.map, key as string);
    const state = new CrdtListState(nestedArray) as ListState<any>;
    this._subStates[key as string] = state;
    return state;
  }
  getAggregatedStateRecord<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): AggregatedStateRecord<RecordState<any>> {
    if (this._subStates[key as string]) {
      throw new Error(
        `Aggregated state for key "${key as string}" already exists.`
      );
    }

    const nestedMap = getOrCreateYMap(this.map, key as string);
    const state = new AggregatedCrdtStateRecord(
      nestedMap,
      () => new CrdtRecordState(new y.Map()) as RecordState<any>
    ) as AggregatedStateRecord<RecordState<any>>;
    this._subStates[key as string] = state;
    return state;
  }
  getAggregatedStateList<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): AggregatedStateList<RecordState<any>> {
    if (this._subStates[key as string]) {
      throw new Error(
        `Aggregated state for key "${key as string}" already exists.`
      );
    }

    const nestedArray = getOrCreateYArray(this.map, key as string);
    const state = new AggregatedCrdtStateList(
      nestedArray as y.Array<any>,
      () => new CrdtRecordState(new y.Map()) as RecordState<any>
    ) as AggregatedStateList<RecordState<any>>;
    this._subStates[key as string] = state;
    return state;
  }
  getValueState<K extends keyof T>(key: K): ValueState<T[K]> {
    if (this._subStates[key as string]) {
      throw new Error(`Value state for key "${key as string}" already exists.`);
    }

    const currentValue = this.map.get(key as string) as T[K];
    const state = new CrdtValueState(this.map, key as string, currentValue);
    this._subStates[key as string] = state;
    return state;
  }

  dispose(): void {
    this.map.unobserve(this.observer);
    this.subject$.complete();
  }
}
