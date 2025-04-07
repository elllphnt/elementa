import { ThreadEntry as ThreadEntryData } from "@elllphnt/intelligence-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { Backend } from "../lib/backend";
import { Resource } from "../lib/resource";
import { intelligenceServiceFactory } from "../services/intelligence_service";
import { IntelligenceThread } from "./intelligence_thread";

export class IntelligenceThreadEntry extends Resource<ThreadEntryData> {
  static readonly entity = elllEntities.intelligenceThreadEntry.name;

  private _threadId$ = new BehaviorSubject<string | undefined>(undefined);
  private _type$ = new BehaviorSubject<string | undefined>(undefined);
  private _data$ = new BehaviorSubject<any>(undefined);
  private _createdAt$ = new BehaviorSubject<Date | undefined>(undefined);

  get intelligenceService() {
    return this.backend.service(intelligenceServiceFactory);
  }

  get threadStore() {
    return this.backend.store(IntelligenceThread);
  }

  get key() {
    return this.id;
  }

  get type() {
    return this._type$.value;
  }
  get type$() {
    return this._type$.asObservable().pipe(distinctUntilChanged());
  }

  get data() {
    return this._data$.value;
  }
  get data$() {
    return this._data$.asObservable().pipe(distinctUntilChanged());
  }

  get threadId() {
    return this._threadId$.value;
  }
  get threadId$() {
    return this._threadId$.asObservable().pipe(distinctUntilChanged());
  }

  get thread() {
    return this.threadId
      ? this.threadStore.instance(this.threadId, true)
      : undefined;
  }
  get thread$() {
    return this.threadId$.pipe(
      map((threadId) =>
        threadId ? this.threadStore.instance(threadId, true) : undefined,
      ),
    );
  }

  get createdAt() {
    return this._createdAt$.value;
  }
  get createdAt$() {
    return this._createdAt$.asObservable().pipe(distinctUntilChanged());
  }

  constructor(init: { id: string; backend: Backend }) {
    super({
      backend: init.backend,
      id: init.id,
      entity: IntelligenceThreadEntry.entity,
    });

    this.addDisposer(() => {
      this._threadId$.complete();
      this._type$.complete();
      this._data$.complete();
      this._createdAt$.complete();
    });
  }

  loadData(data: ThreadEntryData) {
    this._threadId$.next(data.thread_id);
    this._createdAt$.next(new Date(data.created_at ?? 0));
    this._type$.next(data.type);
    this._data$.next(data.data);
  }
  setData(data: any) {
    this._data$.next(data);
  }

  async fetchData() {}
}
