import {
  Domain as DomainData,
  DomainRecordSet,
} from "@elllphnt/networking-service-client";
import { BehaviorSubject, map } from "rxjs";
import { pointerFactory } from "..";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Resource } from "../lib/resource";
import { networkingServiceFactory } from "../services/networking_service";
import { certificateFactory } from "./certificate";

export class Domain extends Resource<DomainData> {
  static modelName = "domain";
  readonly name: string;
  private _pointerName$ = new BehaviorSubject<string | undefined>(undefined);
  private _records$ = new BehaviorSubject<DomainRecordSet | undefined>(
    undefined,
  );
  private _certificateId$ = new BehaviorSubject<string | undefined>(undefined);
  private _tenantId$ = new BehaviorSubject<string | undefined>(undefined);

  private _fetchingRecords$ = new BehaviorSubject<boolean>(false);
  private _fetchingCertificate$ = new BehaviorSubject<boolean>(false);
  private _certificateAutoFetchCount = 0;
  private _deleting$ = new BehaviorSubject<boolean>(false);

  get networkingService() {
    return this.backend.service(networkingServiceFactory);
  }

  get certificateStore() {
    return this.backend.store(certificateFactory);
  }
  get pointerStore() {
    return this.backend.store(pointerFactory);
  }

  get key() {
    return this.name;
  }

  get pointerName$() {
    return this._pointerName$.asObservable();
  }
  get pointerName() {
    return this._pointerName$.value;
  }

  get tenantId$() {
    return this._tenantId$.asObservable();
  }
  get tenantId() {
    return this._tenantId$.value;
  }

  get records$() {
    return this._records$.asObservable();
  }
  get records() {
    return this._records$.value;
  }

  get fetchingRecords$() {
    return this._fetchingRecords$.asObservable();
  }
  get fetchingRecords() {
    return this._fetchingRecords$.value;
  }

  get fetchingCertificate$() {
    return this._fetchingCertificate$.asObservable();
  }
  get fetchingCertificate() {
    return this._fetchingCertificate$.value;
  }

  get deleting$() {
    return this._deleting$.asObservable();
  }
  get deleting() {
    return this._deleting$.value;
  }

  get certificateId$() {
    return this._certificateId$.asObservable();
  }
  get certificateId() {
    return this._certificateId$.value;
  }

  certificate<C extends true | undefined>(create: C) {
    const certificateId = this.certificateId;
    if (!certificateId) {
      if (this._certificateAutoFetchCount < 5) {
        this.fetchCertificate();
        this._certificateAutoFetchCount++;
      }
      return undefined;
    }
    return this.certificateStore.instance(certificateId, create);
  }
  certificate$<C extends true | undefined>(create: C) {
    return this.certificateId$.pipe(
      map((certificateId) => {
        if (!certificateId) {
          if (this._certificateAutoFetchCount < 5) {
            this.fetchCertificate();
            this._certificateAutoFetchCount++;
          }
          return undefined;
        }
        return this.certificateStore.instance(certificateId, create);
      }),
    );
  }

  pointer<C extends true | undefined>(create: C) {
    const pointerName = this.pointerName;
    if (!pointerName) {
      return undefined;
    }
    return this.pointerStore.instance(pointerName, create);
  }
  pointer$<C extends true | undefined>(create: C) {
    return this.pointerName$.pipe(
      map((pointerName) => {
        if (!pointerName) {
          return undefined;
        }
        return this.pointerStore.instance(pointerName, create);
      }),
    );
  }

  constructor(init: { key: string; backend: Backend }) {
    super({
      backend: init.backend,
      type: "domain",
    });
    this.name = init.key;

    this.addDisposer(() => {
      this._pointerName$.complete();
      this._records$.complete();
      this._certificateId$.complete();

      this._fetchingRecords$.complete();
      this._fetchingCertificate$.complete();
    });
  }

  loadData(data: DomainData) {
    this._tenantId$.next(data.tenantId);
    this._pointerName$.next(data.pointer ?? undefined);
    this._certificateId$.next(data.certificateId ?? undefined);
  }
  loadRecords(records: DomainRecordSet) {
    this._records$.next(records);
  }
  loadCertificateId(certificateId: string) {
    this._certificateId$.next(certificateId);
  }

  async fetchData(): Promise<void> {
    await this.networkingService.fetchDomain(this.name);
  }
  async fetchRecords() {
    if (this.fetchingRecords) return;

    try {
      this._fetchingRecords$.next(true);
      await this.networkingService.fetchDomainRecords(this.name);
    } finally {
      this._fetchingRecords$.next(false);
    }
  }
  async fetchCertificate() {
    if (this.fetchingCertificate) return;

    try {
      this._fetchingCertificate$.next(true);
      await this.networkingService.fetchDomainCertificate(this.name);
    } finally {
      this._fetchingCertificate$.next(false);
    }
  }

  assignPointer(pointerName: string) {
    return this.networkingService.assignDomainPointer(this.name, pointerName);
  }
  unassignPointer(pointerName: string) {
    return this.networkingService.unassignDomainPointer(pointerName);
  }

  async delete() {
    try {
      this._deleting$.next(true);
      await this.networkingService.deleteDomain(this.name);
    } finally {
      this._deleting$.next(false);
    }
  }
}

export const domainFactory = createConstructorFactory(Domain, {
  name: "domain",
});
