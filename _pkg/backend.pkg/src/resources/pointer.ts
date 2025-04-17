import { Pointer as PointerData } from "@elllphnt/networking-service-client";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Resource } from "../lib/resource";
import { networkingServiceFactory } from "../services/networking_service";
import { deploymentFactory } from "./deployment";
import { domainFactory } from "./domain";

export class Pointer extends Resource<PointerData> {
  readonly name: string;
  private _target$ = new BehaviorSubject<string | undefined>(undefined);

  get networkingService() {
    return this.backend.service(networkingServiceFactory);
  }

  get deploymentStore() {
    return this.backend.store(deploymentFactory);
  }
  get domainsStore() {
    return this.backend.store(domainFactory);
  }

  get key() {
    return this.name;
  }

  get target$() {
    return this._target$.asObservable();
  }
  get target() {
    return this._target$.value;
  }

  get deployment() {
    if (this.target) {
      return this.deploymentStore.instance(this.target);
    } else {
      return undefined;
    }
  }
  get deployment$() {
    return this.target$.pipe(
      map((deploymentId) =>
        deploymentId ? this.deploymentStore.instance(deploymentId) : undefined,
      ),
    );
  }

  domains({ autoFetch }: { autoFetch?: boolean } = {}) {
    return this.domainsStore.query({
      key: `pointer-domains:${this.name}`,
      autoFetch,
      resolve: (domains) =>
        domains.filter((domain) => domain.pointerName === this.name),
      resolve$: (domains$) =>
        domains$.pipe(
          switchMap((domains) =>
            combineLatestOrEmpty(
              domains.map((domain) =>
                domain.pointerName$.pipe(
                  map((pointerName) => ({ domain, pointerName })),
                ),
              ),
            ),
          ),
          map((domains) =>
            domains.filter(({ pointerName }) => pointerName === this.name),
          ),
          map((domains) => domains.map(({ domain }) => domain)),
        ),
      fetch: async () => {
        await this.networkingService.fetchDomains({
          pointer: this.name,
        });
      },
    });
  }

  constructor(init: { key: string; backend: Backend }) {
    super({
      backend: init.backend,
      type: "pointer",
    });

    this.name = init.key;

    this.addDisposer(() => {
      this._target$.complete();
    });
  }

  assignDomain(name: string) {
    return this.networkingService.assignDomainPointer(name, this.name);
  }

  loadData(data: PointerData) {
    this._target$.next(data.target ?? undefined);
  }
  async fetchData() {
    await this.networkingService.fetchPointer(this.name);
  }
}

export const pointerFactory = createConstructorFactory(Pointer, {
  name: "pointer",
});
