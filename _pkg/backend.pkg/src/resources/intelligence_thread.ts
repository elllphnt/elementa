import { Thread as IntelligenceThreadData } from "@elllphnt/intelligence-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { Backend } from "../lib/backend";
import { AutoSavableResource } from "../lib/resource";
import {
  intelligenceServiceFactory,
  RequestHandler,
} from "../services/intelligence_service";
import { IntelligenceMessage } from "./intelligence_thread_message";

export class IntelligenceThread extends AutoSavableResource<IntelligenceThreadData> {
  static readonly entity = elllEntities.intelligenceThread.name;

  private _title$ = new BehaviorSubject<string | undefined>(undefined);
  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);
  private _createdAt$ = new BehaviorSubject<Date | undefined>(undefined);
  private _messaging$ = new BehaviorSubject<boolean>(false);
  private _deleting$ = new BehaviorSubject<boolean>(false);
  private _metadata$ = new BehaviorSubject<any | undefined>(undefined);

  get intelligenceService() {
    return this.backend.service(intelligenceServiceFactory);
  }

  get messageStore() {
    return this.backend.store(IntelligenceMessage);
  }

  get key() {
    return this.id;
  }

  get title() {
    return this._title$.value;
  }
  get title$() {
    return this._title$.asObservable().pipe(distinctUntilChanged());
  }

  get owner() {
    return this._tenantId$.value;
  }
  get owner$() {
    return this._tenantId$.asObservable().pipe(distinctUntilChanged());
  }

  get messaging() {
    return this._messaging$.value;
  }
  get messaging$() {
    return this._messaging$.asObservable();
  }

  get createdAt() {
    return this._createdAt$.value;
  }
  get createdAt$() {
    return this._createdAt$.asObservable();
  }

  get deleting() {
    return this._deleting$.value;
  }
  get deleting$() {
    return this._deleting$.asObservable();
  }

  get metadata() {
    return this._metadata$.value;
  }
  get metadata$() {
    return this._metadata$.asObservable();
  }

  get changes$() {
    return this.title$.pipe(
      map((title) => ({
        title,
      })),
    );
  }

  messages({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.messageStore.query({
      key: `intelligence-thread-messages:${this.id}`,
      resolve$: (drives$) =>
        drives$.pipe(
          map((drives) =>
            drives
              .filter((b) => b.threadId === this.id)
              .sort(
                (a, b) =>
                  (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
              ),
          ),
        ),
      resolve: (drives) =>
        drives
          .filter((b) => b.threadId === this.id)
          .sort(
            (a, b) =>
              (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
          ),
      fetch: async ({ cursor }) => {
        const limit = 10;
        const messages = await this.intelligenceService.fetchMessages({
          thread_id: this.id,
          cursor,
          limit,
        });

        return {
          cursor: messages[messages.length - 1]?.id,
          hasMore: messages.length === limit,
        };
      },
      autoFetch,
    });
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      backend,
      id,
      entity: IntelligenceThread.entity,
    });

    this.addDisposer(() => {
      this._title$.complete();
      this._tenantId$.complete();
    });
  }

  setTitle(title: string) {
    this._title$.next(title);
  }
  loadData(data: IntelligenceThreadData) {
    this._tenantId$.next(data.tenant_id);
    this._title$.next(data.title);
    this._createdAt$.next(
      data.created_at ? new Date(data.created_at) : undefined,
    );
    this._metadata$.next(data.metadata);
  }

  async postMessage({
    content,
    onRequest,
  }: {
    content: string;
    onRequest: RequestHandler;
  }) {
    try {
      this._messaging$.next(true);
      return await this.intelligenceService.postMessage({
        threadId: this.id,
        content,
        onRequest,
      });
    } finally {
      this._messaging$.next(false);
    }
  }

  async fetchData() {
    await this.intelligenceService.fetchThread(this.id);
  }

  async saveData(): Promise<void> {
    await this.intelligenceService.updateThread(this.id, {
      title: this.title,
    });
  }

  async delete() {
    try {
      this._deleting$.next(true);
      await this.intelligenceService.deleteThread(this.id);
    } finally {
      this._deleting$.next(false);
    }
  }
}
