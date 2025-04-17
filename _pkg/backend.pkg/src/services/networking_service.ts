import { networkingServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { certificateFactory } from "../resources/certificate";
import { domainFactory } from "../resources/domain";
import { pointerFactory } from "../resources/pointer";

export class NetworkingService extends Service {
  static serviceName = "networking";

  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get domainStore() {
    return this.backend.store(domainFactory);
  }
  get pointerStore() {
    return this.backend.store(pointerFactory);
  }
  get certificateStore() {
    return this.backend.store(certificateFactory);
  }

  get networkingServiceClient() {
    return this.backend.client(networkingServiceClientFactory);
  }

  // Domains

  async createDomain({ name, tenantId }: { name: string; tenantId: string }) {
    const createDomainResult = await this.networkingServiceClient.post(
      "/domains",
      {
        body: {
          tenantId,
          name,
        },
      },
    );

    if (!createDomainResult.response.ok) {
      throw createDomainResult.error;
    }

    return this.domainStore.push(name, createDomainResult.data);
  }
  async fetchDomain(name: string) {
    const getDomainResult = await this.networkingServiceClient.get(
      "/domains/{domainName}",
      {
        params: {
          path: {
            domainName: name,
          },
        },
      },
    );
    if (
      !getDomainResult.response.ok &&
      getDomainResult.response.status !== 404
    ) {
      throw getDomainResult.error;
    }
    return this.domainStore.push(name, getDomainResult.data);
  }
  async fetchDomains({
    pointer,
    tenantId,
  }: {
    pointer?: string;
    tenantId?: string;
  }) {
    const getDomainsResult = await this.networkingServiceClient.get(
      "/domains",
      {
        params: {
          query: {
            pointer,
            tenantId,
          },
        },
      },
    );

    if (!getDomainsResult.response.ok) {
      throw getDomainsResult.error;
    }

    const domains = getDomainsResult.data || [];
    domains.forEach((domain) => {
      this.domainStore.push(domain.name, domain);
    });
  }
  async assignDomainPointer(domainName: string, pointer: string) {
    const assignDomainResult = await this.networkingServiceClient.put(
      "/domains/{domainName}/pointer",
      {
        params: {
          path: {
            domainName,
          },
        },
        body: pointer,
        bodySerializer: (body) => body,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );

    if (!assignDomainResult.response.ok) {
      throw assignDomainResult.error;
    }

    return this.domainStore.push(domainName, assignDomainResult.data);
  }
  async unassignDomainPointer(domainName: string) {
    const unassignDomainResult = await this.networkingServiceClient.delete(
      "/domains/{domainName}",
      {
        params: {
          path: {
            domainName,
          },
        },
      },
    );

    if (!unassignDomainResult.response.ok) {
      throw unassignDomainResult.error;
    }

    this.domainStore.remove(domainName);
  }
  async fetchDomainRecords(domainName: string) {
    const getRecordsResult = await this.networkingServiceClient.get(
      "/domains/{domainName}/records",
      {
        params: {
          path: {
            domainName,
          },
          query: {
            ts: new Date().getTime(), // to avoid cache
          },
        },
      },
    );

    if (!getRecordsResult.response.ok) {
      throw getRecordsResult.error;
    }

    return this.domainStore
      .instance(domainName, true)
      .loadRecords(getRecordsResult.data as any);
  }
  async deleteDomain(domainName: string) {
    const deleteDomainResult = await this.networkingServiceClient.delete(
      "/domains/{domainName}",
      {
        params: {
          path: {
            domainName,
          },
        },
      },
    );

    if (!deleteDomainResult.response.ok) {
      throw deleteDomainResult.error;
    }

    this.domainStore.remove(domainName);
  }

  // Pointers

  async fetchPointer(pointer: string) {
    const pointerData = await this.networkingServiceClient.get(
      "/pointers/{pointerName}",
      {
        params: {
          path: {
            pointerName: pointer,
          },
        },
      },
    );

    if (!pointerData.response.ok) {
      throw pointerData.error;
    }

    return this.pointerStore.push(pointer, pointerData.data);
  }
  async fetchEnvironmentPointer(environmentId: string) {
    const pointerData = await this.networkingServiceClient.get(
      "/pointers/environment/{environmentId}",
      {
        params: {
          path: {
            environmentId,
          },
        },
      },
    );

    if (!pointerData.response.ok && pointerData.response.status !== 404) {
      throw pointerData.error;
    }

    const pointer = pointerData.data?.name;
    if (pointer) {
      return this.pointerStore.push(pointer, pointerData.data);
    }
  }
  async fetchPointers(deploymentId: string) {
    const pointersResult = await this.networkingServiceClient.get("/pointers", {
      params: {
        query: {
          target: deploymentId,
        },
      },
    });

    if (!pointersResult.response.ok) {
      throw pointersResult.error;
    }

    const pointers = pointersResult.data || [];
    pointers.forEach((pointer) => {
      this.pointerStore.push(pointer.name, pointer);
    });

    return pointers;
  }
  async assignPointer(pointer: string, deploymentId: string) {
    const assignPointerResult = await this.networkingServiceClient.put(
      "/pointers/{pointerName}/target",
      {
        params: {
          path: {
            pointerName: pointer,
          },
        },
        body: deploymentId,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );

    if (!assignPointerResult.response.ok) {
      throw assignPointerResult.error;
    }

    return this.pointerStore.push(pointer, assignPointerResult.data);
  }
  async unassignPointer(pointer: string) {
    const unassignPointerResult = await this.networkingServiceClient.delete(
      "/pointers/{pointerName}",
      {
        params: {
          path: {
            pointerName: pointer,
          },
        },
      },
    );

    if (!unassignPointerResult.response.ok) {
      throw unassignPointerResult.error;
    }

    this.pointerStore.remove(pointer);
  }
  async fetchDomainCertificate(domainName: string) {
    const getDomainCertificateResult = await this.networkingServiceClient.get(
      "/domains/{domainName}/certificate",
      {
        params: {
          path: {
            domainName,
          },
        },
      },
    );

    if (!getDomainCertificateResult.response.ok) {
      throw getDomainCertificateResult.error;
    }

    if (getDomainCertificateResult.data) {
      this.domainStore
        .instance(domainName, true)
        .loadCertificateId(getDomainCertificateResult.data.id);
      return this.certificateStore.push(
        getDomainCertificateResult.data.id,
        getDomainCertificateResult.data,
      );
    } else {
      throw new Error("No certificate found for domain");
    }
  }

  // Certificates
  async fetchCertificate(certificateId: string) {
    const result = await this.networkingServiceClient.get(
      "/certificates/{certificateId}",
      {
        params: {
          path: {
            certificateId,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    this.certificateStore.push(certificateId, result.data);
  }
  async provisionCertificate(certificateId: string) {
    const result = await this.networkingServiceClient.post(
      "/certificates/{certificateId}/provision",
      {
        params: {
          path: {
            certificateId,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    this.certificateStore.push(certificateId, result.data);
  }
  async deleteCertificate(certificateId: string) {
    const result = await this.networkingServiceClient.delete(
      "/certificates/{certificateId}",
      {
        params: {
          path: {
            certificateId,
          },
        },
      },
    );
    if (result.response.ok) {
      this.certificateStore.remove(certificateId);
    } else {
      throw result;
    }
  }
}

export const networkingServiceFactory = createConstructorFactory(
  NetworkingService,
  {
    name: "networking-service",
  },
);
