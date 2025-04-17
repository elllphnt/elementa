import { Certificate as CertificateData } from "@elllphnt/networking-service-client";
import { BehaviorSubject } from "rxjs";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Resource } from "../lib/resource";
import { networkingServiceFactory } from "../services/networking_service";

export class Certificate extends Resource<CertificateData> {
  readonly id: string;
  private _domains$ = new BehaviorSubject<string[]>([]);
  private _status$ = new BehaviorSubject<string | undefined>(undefined);
  private _ready$ = new BehaviorSubject<boolean>(false);

  private _provisioning$ = new BehaviorSubject<boolean>(false);

  get key() {
    return this.id;
  }

  get ready$() {
    return this._ready$.asObservable();
  }
  get ready() {
    return this._ready$.value;
  }

  get domains$() {
    return this._domains$.asObservable();
  }
  get domains() {
    return this._domains$.value;
  }

  get status$() {
    return this._status$.asObservable();
  }
  get status() {
    return this._status$.value;
  }

  get provisioning$() {
    return this._provisioning$.asObservable();
  }
  get provisioning() {
    return this._provisioning$.value;
  }

  get networkingService() {
    return this.backend.service(networkingServiceFactory);
  }

  constructor(init: { key: string; backend: Backend }) {
    super({
      backend: init.backend,
      type: "certificate",
    });
    this.id = init.key;

    this.addDisposer(() => {
      this._domains$.complete();
      this._status$.complete();
      this._ready$.complete();
    });
  }

  loadData(data: CertificateData) {
    this._domains$.next(data.domains);
    this._status$.next(data.status);
    this._ready$.next(data.ready);
  }
  async fetchData() {
    await this.networkingService.fetchCertificate(this.id);
  }
  async provision() {
    try {
      this._provisioning$.next(true);
      await this.networkingService.provisionCertificate(this.id);
    } finally {
      this._provisioning$.next(false);
    }
  }
}

export const certificateFactory = createConstructorFactory(Certificate, {
  name: "certificate",
});
