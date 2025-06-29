import { Observable } from "rxjs";
import { Lifecycle } from "../core/lifecycle.js";
import { ArrayKeyOf, ObjectKeyOf } from "../types/object.js";
import { ListState } from "./list.js";
import { AggregatedStateList } from "./state_list.js";
import { AggregatedStateRecord } from "./state_record.js";
import { ValueState } from "./value.js";

export abstract class RecordState<
  T extends Record<string, any>
> extends Lifecycle {
  abstract get record(): T;
  abstract get record$(): Observable<T>;

  abstract entry<K extends keyof T>(key: K): T[K];
  abstract entry$<K extends keyof T>(key: K): Observable<T[K]>;

  abstract set<K extends keyof T>(key: K, value: T[K]): void;
  abstract remove<K extends keyof T>(key: K): T[K] | undefined;

  abstract setAll(data: Partial<T>): void;
  abstract removeAll(keys: (keyof T)[]): void;

  abstract setRecord(data: T): void;

  abstract getRecordState<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): RecordState<NonNullable<T[K]>>;
  abstract getListState<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): ListState<NonNullable<T[K]>>;

  abstract getAggregatedStateRecord<K extends ObjectKeyOf<Required<T>>>(
    key: K
  ): AggregatedStateRecord<RecordState<NonNullable<T[K]>[string]>>;
  abstract getAggregatedStateList<K extends ArrayKeyOf<Required<T>>>(
    key: K
  ): AggregatedStateList<RecordState<NonNullable<T[K]>[number]>>;

  abstract getValueState<K extends keyof T>(key: K): ValueState<T[K]>;
}
