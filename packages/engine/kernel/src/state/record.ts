import { ArrayKeyOf, ObjectKeyOf } from "@elllphnt/elementa-lang-utils";
import { Observable } from "rxjs";
import { ListState } from "./list.js";
import { State } from "./state.js";
import { ValueState } from "./value.js";

export interface RecordState<T extends Record<string, any>> extends State {
  get record(): T;
  get record$(): Observable<T>;

  entry<K extends keyof T>(key: K): T[K];
  entry<K extends keyof T>(
    key: K,
    fallback: () => NonNullable<T[K]>
  ): NonNullable<T[K]>;
  entry<K extends keyof T>(key: K, fallback?: () => NonNullable<T[K]>): T[K];

  entry$<K extends keyof T>(key: K): Observable<T[K]>;
  entry$<K extends keyof T>(
    key: K,
    fallback: () => NonNullable<T[K]>
  ): Observable<NonNullable<T[K]>>;
  entry$<K extends keyof T>(
    key: K,
    fallback?: () => NonNullable<T[K]>
  ): Observable<T[K]>;

  set<K extends keyof T>(key: K, value: T[K]): void;
  remove<K extends keyof T>(key: K): T[K] | undefined;

  setAll(data: Partial<T>): void;
  removeAll(keys: (keyof T)[]): void;

  setRecord(data: T): void;

  getRecordState<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<NonNullable<T[K]>>;
  getListState<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): ListState<NonNullable<T[K]>[number]>;

  getOptionalRecordState<K extends keyof T>(
    key: K
  ): ValueState<RecordState<NonNullable<T[K]>>>;
  getOptionalListState<K extends keyof T>(
    key: K
  ): ValueState<RecordState<NonNullable<T[K]>>>;

  getListOfRecordStates<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): ListState<RecordState<NonNullable<T[K]>[number]>>;
  getListOfListStates<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): ListState<ListState<NonNullable<T[K]>[number][number]>>;

  getRecordOfRecordStates<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<Record<string, RecordState<NonNullable<T[K][string]>>>>;
  getRecordOfListStates<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<Record<string, ListState<NonNullable<T[K]>[string][number]>>>;
}
