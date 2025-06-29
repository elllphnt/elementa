import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PickArrayKeys, PickObjectKeys } from "../../../types/object.js";
import { ListState } from "../../list.js";
import { RecordState } from "../../record.js";
import { State } from "../../state.js";
import { AggregatedStateList } from "../../state_list.js";
import { AggregatedStateRecord } from "../../state_record.js";
import { ValueState } from "../../value.js";
import { JsonListState } from "./list.js";
import { JsonRecordState } from "./record.js";
import { AggregatedJsonStateList } from "./state_list.js";
import { JsonValueState } from "./value.js";

export class AggregatedJsonStateRecord<
  S extends State
> extends AggregatedStateRecord<S> {
  private readonly subject$: BehaviorSubject<Record<string, S | undefined>>;
  private readonly createState: () => S;
  private _subStates: Record<string, State> = {};

  constructor(init: Record<string, S | undefined> = {}, createState: () => S) {
    super();
    this.createState = createState;
    this.subject$ = new BehaviorSubject<Record<string, S | undefined>>({
      ...init,
    });

    this.addDisposer(() => {
      this.subject$.complete();
      // Dispose all states
      Object.values(this.subject$.value).forEach((state) => state?.dispose());
      Object.values(this._subStates).forEach((state) => state.dispose());
    });
  }

  entry(key: string): S | undefined;
  entry(key: string, create: true): S;
  entry(key: string, create?: boolean): S | undefined;
  entry(key: string, create?: boolean): S | undefined {
    const existing = this.subject$.value[key];

    if (existing || !create) {
      return existing;
    }

    // Create new state if requested
    const newState = this.createState();
    const current = { ...this.subject$.value };
    current[key] = newState;
    this.subject$.next(current);
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

        // Create new state if requested and doesn't exist
        const newState = this.createState();
        const current = { ...this.subject$.value };
        current[key] = newState;
        this.subject$.next(current);
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
    const current = { ...this.subject$.value };
    if (value === undefined) {
      // Dispose the existing state before removing
      const existing = current[key];
      if (existing) {
        existing.dispose();
      }
      delete current[key];
    } else {
      // Dispose the existing state before replacing
      const existing = current[key];
      if (existing && existing !== value) {
        existing.dispose();
      }
      current[key] = value;
    }
    this.subject$.next(current);
  }

  remove<K extends string>(key: K): S | undefined {
    const current = { ...this.subject$.value };
    const value = current[key];
    delete current[key];
    this.subject$.next(current);

    // Dispose the removed state
    if (value) {
      value.dispose();
    }

    return value;
  }

  setAll(data: Partial<Record<string, S | undefined>>): void {
    const current = { ...this.subject$.value };
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        // Dispose the existing state before removing
        const existing = current[key];
        if (existing) {
          existing.dispose();
        }
        delete current[key];
      } else {
        // Dispose the existing state before replacing
        const existing = current[key];
        if (existing && existing !== value) {
          existing.dispose();
        }
        current[key] = value;
      }
    });
    this.subject$.next(current);
  }

  removeAll(keys: string[]): void {
    const current = { ...this.subject$.value };
    keys.forEach((key) => {
      const existing = current[key];
      if (existing) {
        existing.dispose();
      }
      delete current[key];
    });
    this.subject$.next(current);
  }

  setRecord(data: Record<string, S | undefined>): void {
    // Dispose existing states
    Object.values(this.subject$.value).forEach((state) => state?.dispose());

    // Set new data
    this.subject$.next({ ...data });
  }

  getRecordState<
    K extends keyof PickObjectKeys<Required<Record<string, S | undefined>>>
  >(key: K): RecordState<any> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as RecordState<any>;
    }

    const state = new JsonRecordState({} as any) as RecordState<any>;
    this._subStates[key as string] = state;
    return state;
  }

  getListState<
    K extends keyof PickArrayKeys<Required<Record<string, S | undefined>>>
  >(key: K): ListState<any> {
    if (this._subStates[key as string]) {
      return this._subStates[key as string] as ListState<any>;
    }

    const state = new JsonListState([]) as ListState<any>;
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

    const state = new AggregatedJsonStateRecord(
      {},
      () => new JsonRecordState({}) as RecordState<any>
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

    const state = new AggregatedJsonStateList(
      [],
      () => new JsonRecordState({}) as RecordState<any>
    ) as AggregatedStateList<RecordState<any>>;
    this._subStates[key as string] = state;
    return state;
  }

  getValueState<K extends string>(key: K): ValueState<S | undefined> {
    if (this._subStates[key]) {
      return this._subStates[key] as ValueState<S | undefined>;
    }

    const state = new JsonValueState<S | undefined>(undefined);
    this._subStates[key] = state;
    return state;
  }
}
