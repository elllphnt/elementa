import { User as UserData } from "@elllphnt/identity-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { Backend } from "../lib/backend";
import { SavableResource } from "../lib/resource";
import { configurationServiceFactory } from "../services/configuration_service";
import { identityServiceFactory } from "../services/identity_service";
import { Configuration } from "./configuration";
import { Tenant } from "./tenant";

export class User extends SavableResource<UserData> {
  static readonly entity = elllEntities.user.name;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _email$ = new BehaviorSubject<string | undefined>(undefined);
  private _picture$ = new BehaviorSubject<string | undefined>(undefined);
  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);

  get identityService() {
    return this.backend.service(identityServiceFactory);
  }
  get configurationService() {
    return this.backend.service(configurationServiceFactory);
  }

  get configurationStore() {
    return this.backend.store(Configuration);
  }

  get tenantStore() {
    return this.backend.store(Tenant);
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable().pipe(distinctUntilChanged());
  }

  get email() {
    return this._email$.value;
  }
  get email$() {
    return this._email$.asObservable().pipe(distinctUntilChanged());
  }

  get picture() {
    return this._picture$.value;
  }
  get picture$() {
    return this._picture$.asObservable().pipe(distinctUntilChanged());
  }

  get tenantId() {
    return this._tenantId$.value;
  }
  get tenantId$() {
    return this._tenantId$.asObservable().pipe(distinctUntilChanged());
  }

  configuration(key: string) {
    return this.configurationStore.query({
      key: `configuration:${this.id}:${key}`,
      resolve: (configurations) =>
        configurations.find((c) => c.owner === this.id && c.key === key),
      resolve$: (configurations$) =>
        configurations$.pipe(
          map((configurations) =>
            configurations.find((c) => c.owner === this.id && c.key === key),
          ),
        ),
      fetch: () =>
        this.configurationService.fetchConfiguration({ owner: this.id, key }),
      autoFetch: true,
    });
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: User.entity,
    });

    this.addDisposer(() => {
      this._name$.complete();
      this._email$.complete();
      this._picture$.complete();
      this._tenantId$.complete();
    });
  }
  loadData(data: UserData) {
    this._name$.next(data.name);
    this._email$.next(data.email);
    this._picture$.next(data.picture);
    this._tenantId$.next(data.tenant_id);
  }
  async fetchData() {
    await this.identityService.fetchUser(this.id);
  }
  async saveData(): Promise<void> {
    await this.identityService.updateTenant(this.id, {
      name: this.name,
    });
  }
}
