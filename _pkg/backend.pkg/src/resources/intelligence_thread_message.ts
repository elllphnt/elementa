import { Message as IntelligenceMessageData } from "@elllphnt/intelligence-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { Backend } from "../lib/backend";
import { Resource } from "../lib/resource";
import {
  intelligenceServiceFactory,
  MessageContent,
} from "../services/intelligence_service";
import { IntelligenceThread } from "./intelligence_thread";

export class IntelligenceMessage extends Resource<IntelligenceMessageData> {
  static readonly entity = elllEntities.intelligenceMessage.name;

  private _threadId$ = new BehaviorSubject<string | undefined>(undefined);
  private _role$ = new BehaviorSubject<string | undefined>(undefined);
  private _content$ = new BehaviorSubject<
    {
      type?: string;
      text?: string;
      image_url?: string;
    }[]
  >([]);
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

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable().pipe(distinctUntilChanged());
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

  get role() {
    return this._role$.value;
  }
  get role$() {
    return this._role$.asObservable().pipe(distinctUntilChanged());
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
      entity: IntelligenceMessage.entity,
    });

    this.addDisposer(() => {
      this._content$.complete();
      this._threadId$.complete();
      this._role$.complete();
    });
  }

  loadData(data: IntelligenceMessageData) {
    if (typeof data.content === "string") {
      this._content$.next([
        {
          type: "text",
          text: data.content,
        },
      ]);
    } else {
      this._content$.next(data.content ?? []);
    }
    this._threadId$.next(data.thread_id);
    this._role$.next(data.role);
    this._createdAt$.next(new Date(data.created_at ?? 0));
  }
  concatContent(content: MessageContent[]) {
    this._content$.next([...this._content$.value, ...content]);
  }

  async fetchData() {}
}
