import { workspaceServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { Workspace } from "../resources/workspace";
import { WorkspaceFile } from "../resources/workspace_file";

export class WorkspaceService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get workspaceStore() {
    return this.backend.store(Workspace);
  }
  get workspaceFileStore() {
    return this.backend.store(WorkspaceFile);
  }

  get workspaceServiceClient() {
    return this.backend.client(workspaceServiceClientFactory);
  }

  private _clearFileData(id: string) {
    const fileStore = this.workspaceFileStore;

    const file = fileStore.instance(id);

    fileStore.remove(id);
    if (file?.isDirectory) {
      const path = file.path;
      if (path !== undefined) {
        // clear all files in directory
        const files = fileStore.instances.filter(
          (f) => f.driveId === file.driveId && file.isAncestorOf(f),
        );

        files.forEach((file) => {
          fileStore.remove(file.id);
        });
      }
    }
  }

  // Workspace

  async createWorkspace({
    name,
    tenant_id,
  }: {
    name: string;
    tenant_id: string;
  }) {
    const result = await this.workspaceServiceClient.post("/workspaces", {
      body: {
        tenant_id,
        name,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.workspaceStore.push(result.data);
    }
  }
  async fetchWorkspace(workspace_id: string) {
    const result = await this.workspaceServiceClient.get(
      "/workspaces/{workspace_id}",
      {
        params: {
          path: {
            workspace_id,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.workspaceStore.push(result.data);
    } else {
      this.workspaceStore.instance(workspace_id)?.setNotFound();
    }
  }
  async fetchWorkspaces({ tenant_id }: { tenant_id: string }) {
    const result = await this.workspaceServiceClient.get("/workspaces", {
      params: {
        query: {
          tenant_id,
        },
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    result.data!.map((data) => this.workspaceStore.push(data));
  }
  async updateWorkspace(
    workspace_id: string,
    update: {
      name?: string;
    },
  ) {
    const result = await this.workspaceServiceClient.patch(
      "/workspaces/{workspace_id}",
      {
        params: {
          path: {
            workspace_id,
          },
        },
        body: {
          name: update.name,
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.workspaceStore.push(result.data);
    }
  }
  async deleteWorkspace(workspace_id: string) {
    const result = await this.workspaceServiceClient.delete(
      "/workspaces/{workspace_id}",
      {
        params: {
          path: {
            workspace_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this.workspaceStore.remove(workspace_id);
  }
  async fetchWorkspaceFileAtPath({
    workspace_id,
    path,
    create,
  }: {
    workspace_id: string;
    path: string;
    create?: {
      type: string;
    };
  }) {
    const result = await this.workspaceServiceClient.get(
      "/workspaces/{workspace_id}/file",
      {
        params: {
          path: {
            workspace_id,
          },
          query: {
            path,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.workspaceFileStore.push(result.data);
    } else if (create) {
      return this.createWorkspaceFile({
        workspace_id,
        path,
        type: create.type,
      });
    }
  }

  // Workspace File

  async createWorkspaceFile({
    workspace_id,
    path,
    type,
  }: {
    workspace_id: string;
    path: string;
    type: string;
  }) {
    const result = await this.workspaceServiceClient.post("/workspace-files", {
      body: {
        workspace_id,
        path,
        type,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.workspaceFileStore.push(result.data);
    }
  }
  async fetchWorkspaceFile(file_id: string) {
    const result = await this.workspaceServiceClient.get(
      "/workspace-files/{file_id}",
      {
        params: {
          path: {
            file_id,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.workspaceFileStore.push(result.data);
    }
  }
  async fetchWorkspaceFiles({
    workspace_id,
    include,
    exclude,
    types,
    path,
    depth,
  }: {
    workspace_id: string;
    include?: string[];
    exclude?: string[];
    types?: string[];
    path?: string;
    depth?: number;
  }) {
    const limit = 100;
    let cursor: string | undefined = undefined;
    let hasMore = true;
    const files: WorkspaceFile[] = [];

    while (hasMore) {
      const result = await this.workspaceServiceClient.get(
        "/workspaces/{workspace_id}/files",
        {
          params: {
            path: {
              workspace_id,
            },
            query: {
              path,
              limit,
              cursor,
              depth,
              include: include?.join(","),
              exclude: exclude?.join(","),
              types: types?.join(","),
            } as any,
          },
        },
      );

      if (!result.response.ok) {
        console.error(
          `Failed to list workspace files: ${result.response.statusText}`,
          result.error,
        );
        throw result.response;
      }

      const newFiles: WorkspaceFile[] = result.data!.map((data) =>
        this.workspaceFileStore.push(data),
      );
      files.push(...newFiles);

      if (newFiles.length < limit) {
        hasMore = false;
      } else {
        cursor = newFiles[newFiles.length - 1].id;
      }
    }

    return files;
  }
  async updateWorkspaceFile(
    file_id: string,
    update: {
      path?: string;
      type?: string;
    },
  ) {
    const result = await this.workspaceServiceClient.patch(
      "/workspace-files/{file_id}",
      {
        params: {
          path: {
            file_id,
          },
        },
        body: {
          path: update.path,
          type: update.type,
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.workspaceFileStore.push(result.data);
    }
  }
  async deleteWorkspaceFile(file_id: string) {
    const result = await this.workspaceServiceClient.delete(
      "/workspace-files/{file_id}",
      {
        params: {
          path: {
            file_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this._clearFileData(file_id);
  }
}

export const workspaceServiceFactory = createConstructorFactory(
  WorkspaceService,
  {
    name: "workspace-service",
  },
);
