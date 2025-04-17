import { Sink as SinkData } from "@elllphnt/logging-service-client";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Resource } from "../lib/resource";
import { loggingServiceFactory } from "../services/logging_service";
import { elllephantApiSyncerFactory } from "../syncers/elllephant";
import { logFactory } from "./log";

export class LogSink extends Resource<SinkData> {
  readonly id: string;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _description$ = new BehaviorSubject<string | undefined>(undefined);
  private _status$ = new BehaviorSubject<string | undefined>(undefined);

  get elllephantApiSyncer() {
    return this.backend.syncer(elllephantApiSyncerFactory);
  }

  get loggingService() {
    return this.backend.service(loggingServiceFactory);
  }

  get logStore() {
    return this.backend.store(logFactory);
  }

  get key() {
    return this.id;
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get description() {
    return this._description$.value;
  }
  get description$() {
    return this._description$.asObservable();
  }

  get status() {
    return this._status$.value;
  }
  get status$() {
    return this._status$.asObservable();
  }

  logs({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.logStore.query({
      key: `sink-logs:${this.id}`,
      autoFetch,
      resolve: (logs) => logs.filter((log) => log.sinkId === this.id),
      resolve$: (logs$) =>
        logs$.pipe(
          switchMap((logs) =>
            combineLatestOrEmpty(
              logs.map((log) =>
                log.sinkId$.pipe(
                  map((sinkId) => ({
                    sinkId,
                    log,
                  })),
                ),
              ),
            ),
          ),
          map((logs) => logs.filter((l) => l.sinkId === this.id)),
          map((logs) => logs.map((p) => p.log)),
        ),
      fetch: async () => {
        await this.loggingService.fetchLogs(this.id);
      },
    });
  }

  constructor(init: { key: string; backend: Backend }) {
    super({
      backend: init.backend,
      type: "logsink",
    });

    this.id = init.key;

    // watch logs
    const logsWatchKey = this.elllephantApiSyncer.watchEntities("log", {
      "data.sinkId": this.id,
    } as any);

    this.addDisposer(() => {
      this._name$.complete();
      this._description$.complete();
      this._status$.complete();

      this.elllephantApiSyncer.endWatch(logsWatchKey);
    });
  }

  loadData(data: SinkData) {
    this._name$.next(data.name);
    this._description$.next(data.description);
    this._status$.next(data.status);
  }

  protected async fetchData(): Promise<void> {
    await this.loggingService.fetchSink(this.id);
  }
}

export const logSinkFactory = createConstructorFactory(LogSink, {
  name: "logsink",
});
