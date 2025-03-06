import { configurationServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { Configuration } from "../resources/configuration";

type SignedUrlData = {
  url: string;
  expires: number;
  contentType: string;
};

export class ConfigurationService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get configurationStore() {
    return this.backend.store(Configuration);
  }

  get configurationServiceClient() {
    return this.backend.client(configurationServiceClientFactory);
  }

  // Configuration

  async writeConfiguration({
    owner,
    key,
    data,
  }: {
    owner: string;
    key: string;
    data: any;
  }) {
    const result = await this.configurationServiceClient.post(
      "/configurations/{owner}/{key}",
      {
        params: {
          path: {
            owner,
            key,
          },
        },
        body: { data } as any,
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.configurationStore.push(result.data);
    }
  }
  async fetchConfiguration({ owner, key }: { owner: string; key: string }) {
    const result = await this.configurationServiceClient.get(
      "/configurations/{owner}/{key}",
      {
        params: {
          path: {
            owner,
            key,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.configurationStore.push(result.data);
    } else {
      await this.writeConfiguration({ owner, key, data: {} });
    }
  }

  async deleteConfiguration({ owner, key }: { owner: string; key: string }) {
    const result = await this.configurationServiceClient.delete(
      "/configurations/{owner}/{key}",
      {
        params: {
          path: {
            owner,
            key,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }
  }
}

export const configurationServiceFactory = createConstructorFactory(
  ConfigurationService,
  {
    name: "configuration-service",
  },
);
