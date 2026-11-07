import { getOrCreateYArray, getOrCreateYMap } from "./utils.js";
import type {
  AggregatedStateList,
  ListState,
  RecordState,
  State,
  ValueState} from "@elllphnt/elementa-kernel";
import {
  AggregatedStateRecord
} from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import * as y from "yjs";
import type {
  PickArrayKeys,
  PickObjectKeys,
} from "@elllphnt/elementa-lang-utils";
import { CrdtRecordState } from "./record.js";
import { AggregatedCrdtStateList } from "./state_list.js";
import { CrdtValueState } from "./value.js";

export class AggregatedCrdtStateRecord<
  S extends State
> extends AggregatedStateRecord<S> {
  private readonly map: y.Map<any>;
  private readonly subject$: BehaviorSubject<Record<string, S | undefined>>;
  private readonly createState: () => S;
  private _subStates: Record<string, State> = {};

  constructor(map: y.Map<any>, createState: () => S) {
    super();
    this.map = map;
    this.createState = createState;

    // Initialize subject with current value
    const initial: Record<string, S | undefined> = {};
    for (const [key, value] of map.entries()) {
      // We assume the value is already a valid state or can be converted to one
      initial[key] = value as S;
    }

    this.subject$ = new BehaviorSubject<Record<string, S | undefined>>(initial);

    this.observer = this.observer.bind(this);

    this.addInitializer(() => {
      this.map.observe(this.observer);
    });

    this.addDisposer(() => {
      this.map.unobserve(this.observer);
      this.subject$.complete();
      Object.values(this._subStates).forEach((state) => state.dispose());
    });
  }

  private observer(event: y.YMapEvent<any>) {
    const current = { ...this.subject$.value };

    for (const [key, change] of event.changes.keys.entries()) {
      if (change.action === "add" || change.action === "update") {
        current[key] = this.map.get(key) as S;
      } else if (change.action === "delete") {
        delete current[key];
      }
    }

    this.subject$.next(current);
  }

  entry(key: string): S | undefined;
  entry(key: string, create: true): S;
  entry(key: string, create?: boolean): S | undefined;
  entry(key: string, create?: boolean): S | undefined {
    const existing = this.map.get(key) as S | undefined;

    if (existing || !create) {
      return existing;
    }

    // Create new state if requested
    const newState = this.createState();
    this.map.set(key, newState);
    return newState;
  }

  entry$(key: string): Observable<S | undefined>;
  entry$(key: string, create: true): Observable<S>;
  entry$(key: string, create?: boolean): Observable<S | undefined>;
  entry$(key: string, create?: boolean): Observable<S | undefined> {
    return this.record$.pipe(
      map((record) => {
        const existing = record[key];
        if (existing || !create) {
          return existing;
        }

        // Create new state if requested
        const newState = this.createState();
        this.map.set(key, newState);
        return newState;
      })
    );
  }

  get record(): Record<string, S | undefined> {
    return this.subject$.value;
  }

  get record$(): Observable<Record<string, S | undefined>> {
    return this.subject$.asObservable();
  }

  set<K extends string>(key: K, value: S | undefined): void {
    if (value === undefined) {
      this.map.delete(key);
    } else {
      this.map.set(key, value);
    }
  }

  remove<K extends string>(key: K): S | undefined {
    const value = this.map.get(key) as S | undefined;
    this.map.delete(key);
    return value;
  }

  setAll(data: Partial<Record<string, S | undefined>>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        this.map.delete(key);
      } else {
        this.map.set(key, value);
      }
    });
  }

  removeAll(keys: string[]): void {
    keys.forEach((key) => this.map.delete(key));
  }

  setRecord(data: Record<string, S | undefined>): void {
    // Clear existing data
    this.map.clear();

    // Set new data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        this.map.set(key, value);
      }
    });
  }

  getRecordState<
    K extends keyof PickObjectKeys<Required<Record<string, S | undefined>>>
  >(key: K): RecordState<any> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as RecordState<any>;
    }

    const nestedMap = getOrCreateYMap(this.map, key as string);
    const state = new CrdtRecordState(nestedMap) as RecordState<any>;
    this._subStates[key as string] = state;
    return state;
  }

  getListState<
    K extends keyof PickArrayKeys<Required<Record<string, S | undefined>>>
  >(key: K): ListState<any> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as ListState<any>;
    }

    const nestedArray = getOrCreateYArray(this.map, key as string);
    const state = new AggregatedCrdtStateList(
      nestedArray as y.Array<any>,
      this.createState
    ) as any;
    this._subStates[key as string] = state;
    return state;
  }

  getAggregatedStateRecord<
    K extends keyof PickObjectKeys<Required<Record<string, S | undefined>>>
  >(key: K): AggregatedStateRecord<RecordState<any>> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as AggregatedStateRecord<
        RecordState<any>
      >;
    }

    const nestedMap = getOrCreateYMap(this.map, key as string);
    const state = new AggregatedCrdtStateRecord(
      nestedMap,
      () => new CrdtRecordState(new y.Map()) as RecordState<any>
    ) as AggregatedStateRecord<RecordState<any>>;
    this._subStates[key as string] = state;
    return state;
  }

  getAggregatedStateList<
    K extends keyof PickArrayKeys<Required<Record<string, S | undefined>>>
  >(key: K): AggregatedStateList<RecordState<any>> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as AggregatedStateList<
        RecordState<any>
      >;
    }

    const nestedArray = getOrCreateYArray(this.map, key as string);
    const state = new AggregatedCrdtStateList(
      nestedArray as y.Array<any>,
      () => new CrdtRecordState(new y.Map()) as RecordState<any>
    ) as any;
    this._subStates[key as string] = state;
    return state;
  }

  getValueState<K extends string>(key: K): ValueState<S | undefined> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as ValueState<S | undefined>;
    }

    const currentValue = this.map.get(key as string) as S | undefined;
    const state = new CrdtValueState(this.map, key as string, currentValue);
    this._subStates[key as string] = state;
    return state;
  }
}
