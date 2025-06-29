import { Observable } from "rxjs";
import { RecordState } from "./record.js";
import { State } from "./state.js";

export abstract class AggregatedStateRecord<
  S extends State
> extends RecordState<Record<string, S | undefined>> {
  abstract entry(key: string): S | undefined;
  abstract entry(key: string, create: true): S;
  abstract entry(key: string, create?: boolean): S | undefined;

  abstract entry$(key: string): Observable<S | undefined>;
  abstract entry$(key: string, create: true): Observable<S>;
  abstract entry$(key: string, create?: boolean): Observable<S | undefined>;
}
