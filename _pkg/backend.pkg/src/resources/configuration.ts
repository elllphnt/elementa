import { Configuration as ConfigurationData } from "@elllphnt/configuration-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { Backend } from "../lib/backend";
import { AutoSavableResource } from "../lib/resource";
import { configurationServiceFactory } from "../services/configuration_service";
import { Tenant } from "./tenant";

export class Configuration extends AutoSavableResource<ConfigurationData> {
  static readonly entity = elllEntities.configuration.name;

  private _owner$ = new BehaviorSubject<string | undefined>(undefined);
  private _key$ = new BehaviorSubject<string | undefined>(undefined);
  private _data$ = new BehaviorSubject<any>(undefined);

  get configurationService() {
    return this.backend.service(configurationServiceFactory);
  }

  get tenantStore() {
    return this.backend.store(Tenant);
  }

  get owner$() {
    return this._owner$.pipe(distinctUntilChanged());
  }
  get owner() {
    return this._owner$.value;
  }

  get key$() {
    return this._key$.pipe(distinctUntilChanged());
  }
  get key() {
    return this._key$.value;
  }

  get data$() {
    return this._data$.asObservable();
  }
  get data() {
    return this._data$.value;
  }

  get changes$() {
    return this.data$;
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: Configuration.entity,
    });

    this.watchChanges();

    this.addDisposer(() => {
      this._owner$.complete();
      this._key$.complete();
      this._data$.complete();
    });
  }

  protected loadData(data: ConfigurationData): void {
    this._owner$.next(data.owner);
    this._key$.next(data.key);
    this._data$.next(data.data);
  }

  protected async saveData() {
    if (!this.owner || !this.key || !this.data) {
      console.warn(
        "Configuration owner, key or data is missing, skipping save",
      );
      return;
    }

    await this.configurationService.writeConfiguration({
      owner: this.owner,
      key: this.key,
      data: this.data,
    });
  }
  protected async fetchData() {}

  setData(data: any) {
    this._data$.next(data);
  }
}
