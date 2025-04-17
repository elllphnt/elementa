import { deploymentServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { deploymentFactory } from "../resources/deployment";

export class DeploymentService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get deploymentStore() {
    return this.backend.store(deploymentFactory);
  }
  get deploymentServiceClient() {
    return this.backend.client(deploymentServiceClientFactory);
  }

  // Deployments

  async fetchDeployment(deploymentId: string) {
    const result = await this.deploymentServiceClient.get(
      "/deployments/{deploymentId}",
      {
        params: {
          path: {
            deploymentId,
          },
        },
      },
    );
    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }
    return this.deploymentStore.push(deploymentId, result.data);
  }

  async fetchDeployments({
    commitId,
    environmentId,
    statuses,
  }: {
    commitId?: string;
    environmentId?: string;
    statuses?: string[];
  } = {}) {
    const result = await this.deploymentServiceClient.get("/deployments", {
      params: {
        query: {
          commitId,
          environmentId,
          statuses: statuses?.join(","),
        },
      },
    });
    if (!result.response.ok) {
      throw result.error;
    }
    return result.data!.map((data) => this.deploymentStore.push(data.id, data));
  }
  async createDeployment({
    commitId,
    environmentId,
    options,
  }: {
    commitId: string;
    environmentId: string;
    options?: {};
  }) {
    const result = await this.deploymentServiceClient.post("/deployments", {
      body: {
        commitId,
        environmentId,
        options: {
          pointers: [`environment:${environmentId}`],
        },
      },
    });
    if (!result.response.ok) {
      throw result.error;
    }
    return this.deploymentStore.push(result.data!.id, result.data);
  }
}

export const deploymentServiceFactory = createConstructorFactory(
  DeploymentService,
  {
    name: "deployment-service",
  },
);
