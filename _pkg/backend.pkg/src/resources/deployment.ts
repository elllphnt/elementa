import { Deployment as DeploymentData } from "@elllphnt/deployment-service-client";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Resource } from "../lib/resource";
import { deploymentServiceFactory } from "../services/deployment_service";
import { commitFactory } from "./commit";
import { Environment, environmentFactory } from "./environment";
import { logSinkFactory } from "./log_sink";
import { pointerFactory } from "./pointer";

export class Deployment extends Resource<DeploymentData> {
  readonly id: string;
  private _commitId$ = new BehaviorSubject<string | undefined>(undefined);
  private _environmentId$ = new BehaviorSubject<string | undefined>(undefined);
  private _logSinkId$ = new BehaviorSubject<string | undefined>(undefined);
  private _status$ = new BehaviorSubject<string | undefined>(undefined);
  private _createdAt$ = new BehaviorSubject<Date | undefined>(undefined);
  private _startedAt$ = new BehaviorSubject<Date | undefined>(undefined);
  private _endedAt$ = new BehaviorSubject<Date | undefined>(undefined);

  get deploymentService() {
    return this.backend.service(deploymentServiceFactory);
  }

  get logSinkStore() {
    return this.backend.store(logSinkFactory);
  }
  get pointerStore() {
    return this.backend.store(pointerFactory);
  }
  get environmentStore() {
    return this.backend.store(environmentFactory);
  }
  get commitStore() {
    return this.backend.store(commitFactory);
  }

  get key() {
    return this.id;
  }

  get commitId() {
    return this._commitId$.value;
  }
  get commitId$() {
    return this._commitId$.asObservable();
  }

  get environmentId() {
    return this._environmentId$.value;
  }
  get environmentId$() {
    return this._environmentId$.asObservable();
  }

  get environment(): Environment | undefined {
    if (!this.environmentId) return undefined;
    return this.environmentStore.instance(this.environmentId, true);
  }
  get environment$(): Observable<Environment | undefined> {
    return this.environmentId$.pipe(
      map((environmentId) => {
        if (!environmentId) return undefined;
        return this.environmentStore.instance(environmentId, true);
      }),
    );
  }

  get commit() {
    if (!this.commitId) return undefined;
    return this.commitStore.instance(this.commitId, true);
  }
  get commit$() {
    return this.commitId$.pipe(
      map((commitId) => {
        if (!commitId) return undefined;
        return this.commitStore.instance(commitId, true);
      }),
    );
  }

  get logSinkId() {
    return this._logSinkId$.value;
  }
  get logSinkId$() {
    return this._logSinkId$.asObservable();
  }

  get status() {
    return this._status$.value;
  }
  get status$() {
    return this._status$.asObservable();
  }

  get createdAt() {
    return this._createdAt$.value;
  }
  get createdAt$() {
    return this._createdAt$.asObservable();
  }

  get startedAt() {
    return this._startedAt$.value;
  }
  get startedAt$() {
    return this._startedAt$.asObservable();
  }

  get endedAt() {
    return this._endedAt$.value;
  }
  get endedAt$() {
    return this._endedAt$.asObservable();
  }

  get duration() {
    if (!this.startedAt || !this.endedAt) return undefined;
    return this.endedAt.getTime() - this.startedAt.getTime();
  }
  get duration$() {
    return combineLatestOrEmpty([this.startedAt$, this.endedAt$]).pipe(
      map(([startedAt, endedAt]) => {
        if (!startedAt || !endedAt) return undefined;
        return endedAt.getTime() - startedAt.getTime();
      }),
    );
  }

  get logSink() {
    if (!this.logSinkId) return undefined;
    return this.logSinkStore.instance(this.logSinkId, true);
  }
  get logSink$() {
    return this.logSinkId$.pipe(
      map((logSinkId) => {
        if (!logSinkId) return undefined;
        return this.logSinkStore.instance(logSinkId, true);
      }),
    );
  }

  pointers({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.pointerStore.query({
      key: `deployment-pointers:${this.id}`,
      autoFetch,
      resolve: (pointers) =>
        pointers.filter((pointer) => pointer.target === this.id),
      resolve$: (pointers$) =>
        pointers$.pipe(
          switchMap((pointers) =>
            combineLatestOrEmpty(
              pointers.map((pointer) =>
                pointer.target$.pipe(
                  map((deploymentId) => ({
                    deploymentId,
                    pointer,
                  })),
                ),
              ),
            ),
          ),
          map((pointers) =>
            pointers.filter(
              (p) => p.deploymentId === this.id && p.pointer.target === this.id,
            ),
          ),
          map((pointers) => pointers.map((p) => p.pointer)),
        ),
    });
  }

  constructor(init: { key: string; backend: Backend }) {
    super({
      backend: init.backend,
      type: "deployment",
    });
    this.id = init.key;

    this.addDisposer(() => {
      this._commitId$.complete();
      this._environmentId$.complete();
      this._logSinkId$.complete();
      this._status$.complete();
      this._createdAt$.complete();
      this._startedAt$.complete();
      this._endedAt$.complete();
    });
  }

  loadData(data: DeploymentData) {
    this._commitId$.next(data.commitId);
    this._environmentId$.next(data.environmentId);
    this._logSinkId$.next(data.logSinkId);
    this._status$.next(data.status);
    this._createdAt$.next(
      data.createdAt ? new Date(data.createdAt) : undefined,
    );
    this._startedAt$.next(
      data.startedAt ? new Date(data.startedAt) : undefined,
    );
    this._endedAt$.next(data.endedAt ? new Date(data.endedAt) : undefined);
  }
  async fetchData(): Promise<void> {
    await this.deploymentService.fetchDeployment(this.id);
  }
}

export const deploymentFactory = createConstructorFactory(Deployment, {
  name: "deployment",
});
