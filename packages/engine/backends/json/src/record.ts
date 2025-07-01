import {
  Backend,
  ListState,
  RecordState,
  ValueState,
} from "@elllphnt/elementa-kernel";
import { ArrayKeyOf, ObjectKeyOf } from "@elllphnt/elementa-lang-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import { JsonListState } from "./list.js";
import { JsonState } from "./state.js";
import { JsonValueState } from "./value.js";

export class JsonRecordState<T extends Record<string, unknown>>
  extends JsonState
  implements RecordState<T>
{
  private _entries$: BehaviorSubject<any>;

  constructor({ init, backend }: { init: T; backend: Backend }) {
    super({ backend });
    this._entries$ = new BehaviorSubject<any>({ ...init });

    this.addDisposer(() => {
      this._entries$.complete();
      Object.values(this._entries$.value).forEach((state) => {
        if (state instanceof JsonState) {
          state.dispose();
        }
      });
    });
  }

  get record(): T {
    return this._entries$.value;
  }

  get record$(): Observable<T> {
    return this._entries$.asObservable();
  }

  entry<K extends keyof T>(key: K): T[K];
  entry<K extends keyof T>(
    key: K,
    fallback: () => NonNullable<T[K]>
  ): NonNullable<T[K]>;
  entry<K extends keyof T>(key: K, fallback?: () => NonNullable<T[K]>): T[K] {
    const value = this._entries$.value[key];
    if (value == null && fallback) {
      return fallback();
    }
    return value;
  }

  entry$<K extends keyof T>(key: K): Observable<T[K]>;
  entry$<K extends keyof T>(
    key: K,
    fallback: () => NonNullable<T[K]>
  ): Observable<NonNullable<T[K]>>;
  entry$<K extends keyof T>(
    key: K,
    fallback?: () => NonNullable<T[K]>
  ): Observable<T[K]> {
    return this.record$.pipe(
      map((v) => {
        const value = v[key];
        if (value == null && fallback) {
          return fallback();
        }
        return value;
      }),
      distinctUntilChanged()
    );
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const current = { ...this._entries$.value };
    current[key] = value;
    this._entries$.next(current);
  }

  remove<K extends keyof T>(key: K): T[K] | undefined {
    const current = { ...this._entries$.value };
    const value = current[key];
    delete current[key];
    this._entries$.next(current);
    return value;
  }

  setAll(data: Partial<T>): void {
    const current = { ...this._entries$.value };
    Object.assign(current, data);
    this._entries$.next(current);
  }

  removeAll(keys: (keyof T)[]): void {
    const current = { ...this._entries$.value };
    keys.forEach((key) => delete current[key]);
    this._entries$.next(current);
  }

  setRecord(data: T): void {
    this._entries$.next({ ...data });
  }

  getRecordState<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<NonNullable<T[K]>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonRecordState) {
      return nestedState as RecordState<NonNullable<T[K]>>;
    }

    nestedState = new JsonRecordState({
      init: nestedState || {},
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as RecordState<NonNullable<T[K]>>;
  }

  getListState<K extends ArrayKeyOf<Required<T>>>(key: K): ListState<any> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonListState) {
      return nestedState as ListState<any>;
    }

    nestedState = new JsonListState({
      init: nestedState || [],
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as ListState<any>;
  }

  getOptionalRecordState<K extends keyof T>(
    key: K
  ): ValueState<RecordState<NonNullable<T[K]>>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonValueState) {
      return nestedState as ValueState<RecordState<NonNullable<T[K]>>>;
    }

    let recordState: JsonRecordState<any> | undefined;
    if (nestedState) {
      recordState = new JsonRecordState({
        init: nestedState as Record<string, unknown>,
        backend: this.backend,
      });
      recordState.initialize();
    }

    nestedState = new JsonValueState({
      init: recordState,
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as ValueState<RecordState<NonNullable<T[K]>>>;
  }

  getOptionalListState<K extends keyof T>(
    key: K
  ): ValueState<RecordState<NonNullable<T[K]>>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonValueState) {
      return nestedState as ValueState<RecordState<NonNullable<T[K]>>>;
    }

    let recordState: JsonRecordState<any> | undefined;
    if (nestedState) {
      recordState = new JsonRecordState({
        init: nestedState as Record<string, unknown>,
        backend: this.backend,
      });
      recordState.initialize();
    }

    nestedState = new JsonValueState({
      init: recordState,
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as ValueState<RecordState<NonNullable<T[K]>>>;
  }

  getListOfRecordStates<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): ListState<RecordState<any>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonListState) {
      return nestedState as ListState<RecordState<any>>;
    }

    const init = nestedState ?? [];
    if (!Array.isArray(init)) {
      throw Error(`Value in key ${key as string} is not an array.`);
    }

    nestedState = new JsonListState({
      init: init.map((i) => {
        const recordState = new JsonRecordState({
          init: i,
          backend: this.backend,
        });
        recordState.initialize();
        return recordState;
      }),
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as ListState<RecordState<any>>;
  }

  getListOfListStates<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): ListState<ListState<any[number]>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonListState) {
      return nestedState as ListState<ListState<any[number]>>;
    }

    const init = nestedState ?? [];
    if (!Array.isArray(init)) {
      throw Error(`Value in key ${key as string} is not an array.`);
    }

    nestedState = new JsonListState({
      init: init.map((arr) => {
        if (!Array.isArray(arr)) {
          throw Error(`Nested value is not an array.`);
        }
        const listState = new JsonListState({
          init: arr,
          backend: this.backend,
        });
        listState.initialize();
        return listState;
      }),
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as ListState<ListState<any[number]>>;
  }

  getRecordOfRecordStates<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<Record<string, RecordState<any>>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonRecordState) {
      return nestedState as RecordState<Record<string, RecordState<any>>>;
    }

    const init = nestedState ?? {};
    if (typeof init !== "object" || Array.isArray(init)) {
      throw Error(`Value in key ${key as string} is not an object.`);
    }

    const recordOfRecords: Record<string, RecordState<any>> = {};
    Object.entries(init).forEach(([subKey, subValue]) => {
      const recordState = new JsonRecordState({
        init: (subValue || {}) as Record<string, unknown>,
        backend: this.backend,
      }) as RecordState<any>;
      recordState.initialize();
      recordOfRecords[subKey] = recordState;
    });

    nestedState = new JsonRecordState({
      init: recordOfRecords,
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as RecordState<Record<string, RecordState<any>>>;
  }

  getRecordOfListStates<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<Record<string, ListState<any>>> {
    let nestedState = this._entries$.value[key];
    if (nestedState instanceof JsonRecordState) {
      return nestedState as RecordState<Record<string, ListState<any>>>;
    }

    const init = nestedState ?? {};
    if (typeof init !== "object" || Array.isArray(init)) {
      throw Error(`Value in key ${key as string} is not an object.`);
    }

    const recordOfLists: Record<string, ListState<any>> = {};
    Object.entries(init).forEach(([subKey, subValue]) => {
      if (!Array.isArray(subValue)) {
        throw Error(`Value in nested key ${subKey} is not an array.`);
      }
      const state = new JsonListState({
        init: subValue,
        backend: this.backend,
      });
      state.initialize();
      recordOfLists[subKey] = state as ListState<any>;
    });

    nestedState = new JsonRecordState({
      init: recordOfLists,
      backend: this.backend,
    });
    nestedState.initialize();
    this._entries$.next({
      ...this._entries$.value,
      [key]: nestedState,
    });
    return nestedState as RecordState<Record<string, ListState<any>>>;
  }
}
