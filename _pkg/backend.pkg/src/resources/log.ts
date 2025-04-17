import { Log as LogData } from "@elllphnt/logging-service-client";
import { BehaviorSubject } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Resource } from "../lib/resource";

export class Log extends Resource<LogData> {
  readonly id: string;

  private _sinkId$ = new BehaviorSubject<string | undefined>(undefined);
  private _level$ = new BehaviorSubject<string | undefined>(undefined);
  private _message$ = new BehaviorSubject<string | undefined>(undefined);
  private _metadata$ = new BehaviorSubject<any | undefined>(undefined);
  private _timestamp$ = new BehaviorSubject<number | undefined>(undefined);

  get key() {
    return this.id;
  }

  get sinkId() {
    return this._sinkId$.value;
  }
  get sinkId$() {
    return this._sinkId$.asObservable();
  }

  get level() {
    return this._level$.value;
  }
  get level$() {
    return this._level$.asObservable();
  }

  get message() {
    return this._message$.value;
  }
  get message$() {
    return this._message$.asObservable();
  }

  get metadata() {
    return this._metadata$.value;
  }
  get metadata$() {
    return this._metadata$.asObservable();
  }

  get timestamp() {
    return this._timestamp$.value;
  }
  get timestamp$() {
    return this._timestamp$.asObservable();
  }

  constructor(init: { key: string; backend: Backend }) {
    super({
      backend: init.backend,
      type: "log",
    });

    this.id = init.key;

    this.addDisposer(() => {
      this._sinkId$.complete();
      this._level$.complete();
      this._message$.complete();
      this._metadata$.complete();
      this._timestamp$.complete();
    });
  }

  loadData(data: LogData) {
    if ("id" in data) {
      this._sinkId$.next(data.sinkId);
      this._level$.next(data.level);
      this._message$.next(data.message);
      this._metadata$.next(data.metadata);
      this._timestamp$.next(data.timestamp);
    }
  }

  protected _save(): Promise<void> {
    return Promise.resolve();
  }
  protected async fetchData(): Promise<void> {}
}

export const logFactory = createConstructorFactory(Log, {
  name: "log",
});
