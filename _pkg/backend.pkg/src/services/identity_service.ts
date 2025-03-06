import { identityServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { Tenant } from "../resources/tenant";
import { User } from "../resources/user";

export class IdentityService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get userStore() {
    return this.backend.store(User);
  }
  get tenantStore() {
    return this.backend.store(Tenant);
  }

  get identityServiceClient() {
    return this.backend.client(identityServiceClientFactory);
  }

  // User

  async fetchUser(user_id: string) {
    const result = await this.identityServiceClient.get("/users/{user_id}", {
      params: {
        path: {
          user_id,
        },
      },
    });

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      return this.userStore.push(result.data);
    }
  }

  // Tenant

  async fetchTenant(tenantId: string) {
    const result = await this.identityServiceClient.get("/tenants/{tenantId}", {
      params: {
        path: {
          tenantId,
        },
      },
    });

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      return this.tenantStore.push(result.data);
    }
  }
  async updateTenant(tenantId: string, data: any) {
    const result = await this.identityServiceClient.patch(
      "/tenants/{tenantId}",
      {
        params: {
          path: {
            tenantId,
          },
        },
        body: data,
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.tenantStore.push(result.data);
    }
  }
}

export const identityServiceFactory = createConstructorFactory(
  IdentityService,
  {
    name: "identity-service",
  },
);
