import { Tenant as TenantData } from "@elllphnt/identity-service-client";
import { elllEntities } from "@elllphnt/utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { Backend } from "../lib/backend";
import { SavableResource } from "../lib/resource";
import { identityServiceFactory } from "../services/identity_service";
import { repositoryServiceFactory } from "../services/repository_service";
import { Repository } from "./repository";

export class Tenant extends SavableResource<TenantData> {
  static readonly entity = elllEntities.tenant.name;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);

  get identityService() {
    return this.backend.service(identityServiceFactory);
  }
  get repositoryService() {
    return this.backend.service(repositoryServiceFactory);
  }

  get repositoryStore() {
    return this.backend.store(Repository);
  }

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable().pipe(distinctUntilChanged());
  }

  repositories({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.repositoryStore.query({
      key: `tenant-repositories:${this.id}`,
      resolve$: (repositories$) =>
        repositories$.pipe(
          map((repositories) =>
            repositories.filter((w) => w.tenantId === this.id),
          ),
        ),
      resolve: (repositories) =>
        repositories.filter((w) => w.tenantId === this.id),
      fetch: async () => {
        await this.repositoryService.fetchRepositories({
          tenant_id: this.id,
        });
      },
      autoFetch,
    });
  }

  constructor({ id, backend }: { id: string; backend: Backend }) {
    super({
      id,
      backend,
      entity: Tenant.entity,
    });

    this.addDisposer(() => {
      this._name$.complete();
    });
  }

  setName(name: string) {
    this._name$.next(name);
  }
  loadData(data: TenantData) {
    this._name$.next(data.name);
  }

  createRepository({ name, type }: { name: string; type: string }) {
    return this.repositoryService.createRepository({
      name,
      tenant_id: this.id,
      type,
    });
  }

  async fetchData() {
    await this.identityService.fetchTenant(this.id);
  }

  async saveData(): Promise<void> {
    await this.identityService.updateTenant(this.id, {
      name: this.name,
    });
  }
}
