import {
  createSubscriptionClient,
  Interest,
  Subscription,
} from "@elllphnt/pubsub-service-client";
import { EntityName } from "@elllphnt/utils";
import { Disposable } from "@repo/utils";
import { filter, Subject } from "rxjs";
import { Backend } from "./lib/backend";

export type SubscriptionClient = ReturnType<typeof createSubscriptionClient>;

export class Syncer extends Disposable {
  static instance(backend: Backend) {
    const syncer = backend.getProperty("syncer");
    if (!syncer) {
      throw new Error("Syncer not found in backend");
    }
    return syncer as Syncer;
  }
  static setInstance(backend: Backend, syncer: Syncer) {
    backend.setProperty("syncer", syncer);
  }

  private _subscriptionKey = 0;

  readonly backend: Backend;
  readonly baseUrl: string;
  readonly client: SubscriptionClient;

  private _event$: Subject<{ topic: string; payload: any }> = new Subject();
  private _localSubscriptions: Map<
    number,
    {
      query: Array<{ topic: string; filter: any }>;
      interests?: Promise<Interest[]>;
    }
  > = new Map();

  subscription: Subscription | undefined;

  get event$() {
    return this._event$.asObservable();
  }
  get entityEvent$() {
    return this.event$.pipe(
      filter((event) => event.topic.startsWith("entity.")),
    );
  }

  constructor({ baseUrl, backend }: { baseUrl: string; backend: Backend }) {
    super();

    this.backend = backend;
    this.baseUrl = baseUrl;
    this.client = createSubscriptionClient({
      baseUrl,
      createEventSource: (url) => new EventSource(url),
    });

    const subscription = this.entityEvent$.subscribe((event) => {
      console.log("entity Event", event);
      switch (event.topic) {
        case "entity.created": {
          const entity = this.backend.instance(event.payload.id, true);
          entity.load(event.payload);
          break;
        }
        case "entity.updated": {
          const entity = this.backend.instance(event.payload.id, true);
          entity.load(event.payload);
          break;
        }
        case "entity.deleted": {
          this.backend.removeInstance(event.payload.id);
          break;
        }
      }
    });

    this.addDisposer(() => {
      subscription.unsubscribe();
    });
  }

  async init() {
    const subscription = await this.client.createSubscription();
    this.client.listenToSubscriptionEvents(subscription.id, (event) => {
      this._event$.next(event);
    });

    this.client.addInterestsToSubscription(subscription.id, [
      { topic: "entity.created" },
      { topic: "entity.updated" },
      { topic: "entity.deleted" },
    ]);

    this.subscription = subscription;
    return subscription;
  }

  async getSubscription() {
    let subcription = this.subscription;
    if (!subcription) {
      subcription = await this.init();
    }
    return subcription;
  }

  watchEntities(entity: EntityName, filter?: any) {
    const key = this._subscriptionKey++;
    this._localSubscriptions.set(key, {
      query: ["entity.created", "entity.updated", "entity.deleted"].map(
        (topic) => ({
          topic,
          filter: {
            entity,
            ...filter,
          },
        }),
      ),
    });
    this._initLocalSubscription(key);
    return () => {
      this._disposeLocalSubscription(key);
    };
  }
  private async _initLocalSubscription(key: number) {
    const localSubscription = this._localSubscriptions.get(key);
    if (!localSubscription) {
      return;
    }

    const subscription = await this.getSubscription();
    const interestPromise = this.client
      .addInterestsToSubscription(subscription.id, localSubscription.query)
      .catch((error) => {
        console.error("Failed to add interests to subscription", error);
        return [] as Interest[];
      });

    this._localSubscriptions.set(key, {
      ...localSubscription,
      interests: interestPromise,
    });
  }
  private _disposeLocalSubscription(key: number) {
    const localSubscription = this._localSubscriptions.get(key);
    if (!localSubscription) {
      return;
    }

    this._localSubscriptions.delete(key);
    localSubscription.interests?.then((interests) => {
      this.client
        .removeInterestsFromSubscription(
          this.subscription!.id,
          interests.map((interest) => interest.id),
        )
        .catch((error) => {
          console.error("Failed to remove interests from subscription", error);
        });
    });
  }
}
