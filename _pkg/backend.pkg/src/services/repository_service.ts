import { repositoryServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { Commit } from "../resources/commit";
import { CommitFile } from "../resources/commit_file";
import { Repository } from "../resources/repository";
import { RepositoryTag } from "../resources/repository_tag";

export type VcsRecord = Record<
  string,
  { type: string; path: string; sha: string }
>;
export class RepositoryService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get repositoryStore() {
    return this.backend.store(Repository);
  }
  get commitStore() {
    return this.backend.store(Commit);
  }
  get commitFileStore() {
    return this.backend.store(CommitFile);
  }
  get tagStore() {
    return this.backend.store(RepositoryTag);
  }

  get repositoryServiceClient() {
    return this.backend.client(repositoryServiceClientFactory);
  }

  // Repository

  async fetchRepository(repository_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/repositories/{repository_id}",
      {
        params: {
          path: {
            repository_id,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      return this.repositoryStore.push(result.data);
    } else {
      this.repositoryStore.instance(repository_id)?.setNotFound();
    }
  }
  async fetchRepositories({ tenant_id }: { tenant_id: string }) {
    const result = await this.repositoryServiceClient.get("/repositories", {
      params: {
        query: {
          tenant_id,
        },
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    result.data!.map((data) => this.repositoryStore.push(data));
  }
  async createRepository(repository: {
    name: string;
    tenant_id: string;
    type: string;
  }) {
    const result = await this.repositoryServiceClient.post("/repositories", {
      body: {
        name: repository.name,
        tenant_id: repository.tenant_id,
        type: repository.type,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    return this.repositoryStore.push(result.data!);
  }
  async updateRepository(
    repository_id: string,
    update: {
      name?: string;
      pointers?: Array<{
        tag_id: string;
        name: string;
      }>;
    },
  ) {
    const result = await this.repositoryServiceClient.patch(
      "/repositories/{repository_id}",
      {
        params: {
          path: {
            repository_id,
          },
        },
        body: {
          name: update.name,
          pointers: update.pointers,
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this.repositoryStore.push(result.data!);
  }
  async deleteRepository(repository_id: string) {
    const result = await this.repositoryServiceClient.delete(
      "/repositories/{repository_id}",
      {
        params: {
          path: {
            repository_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this.repositoryStore.remove(repository_id);
  }

  async fetchRepositoryCommits(
    repository_id: string,
    {
      cursor,
      limit,
    }: {
      cursor?: string | undefined;
      limit?: number;
    },
  ) {
    const result = await this.repositoryServiceClient.get(
      "/repositories/{repository_id}/commits",
      {
        params: {
          path: {
            repository_id,
          },
          query: {
            cursor,
            order: "timestamp:desc",
            limit,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return result.data!.map((data) => this.commitStore.push(data));
  }
  async fetchRepositoryTags(
    repository_id: string,
    {
      cursor,
      limit,
    }: {
      cursor?: string | undefined;
      limit?: number;
    },
  ) {
    const result = await this.repositoryServiceClient.get(
      "/repositories/{repository_id}/tags",
      {
        params: {
          path: {
            repository_id,
          },
          query: {
            cursor,
            order: "created_at:desc",
            limit,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return result.data!.map((data) => this.tagStore.push(data));
  }

  async commitRepositoryWorkspace(
    repository_id: string,
    {
      message,
      committer,
      file_ids,
    }: {
      message: string;
      committer: string;
      file_ids?: string[];
    },
  ) {
    const result = await this.repositoryServiceClient.post(
      "/repositories/{repository_id}/workspace/commit",
      {
        params: {
          path: {
            repository_id,
          },
        },
        body: {
          message,
          committer,
          file_ids,
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      this.commitStore.push(result.data as any);
      this.repositoryStore
        .instance(repository_id)
        ?.setHeadCommitId(result.data.id);
    }
  }
  async resetRepositoryWorkspace(
    repository_id: string,
    {
      file_ids,
      commit_id,
    }: {
      file_ids?: string[];
      commit_id?: string;
    },
  ) {
    const result = await this.repositoryServiceClient.post(
      "/repositories/{repository_id}/workspace/reset",
      {
        params: {
          path: {
            repository_id,
          },
        },
        body: {
          file_ids,
          commit_id,
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }
  }
  async fetchRepositoryWorkspaceRecord(repository_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/repositories/{repository_id}/workspace/record",
      {
        params: {
          path: {
            repository_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return result.data as VcsRecord;
  }

  // Commit

  async fetchCommit(commit_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/commits/{commit_id}",
      {
        params: {
          path: {
            commit_id,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.commitStore.push(result.data);
    }
  }
  async deleteCommit(commit_id: string) {
    const result = await this.repositoryServiceClient.delete(
      "/commits/{commit_id}",
      {
        params: {
          path: {
            commit_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this.commitStore.remove(commit_id);
  }
  async fetchCommitRecord(commit_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/commits/{commit_id}/record",
      {
        params: {
          path: {
            commit_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return result.data as VcsRecord;
  }

  // Commit File

  async fetchCommitFile(file_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/commit-files/{file_id}",
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
      this.commitFileStore.push(result.data);
    }
  }
  async fetchCommitFileAtPath({
    commit_id,
    path,
  }: {
    commit_id: string;
    path: string;
  }) {
    const result = await this.repositoryServiceClient.get(
      "/commits/{commit_id}/file",
      {
        params: {
          path: {
            commit_id,
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
      this.commitFileStore.push(result.data);
    }
  }
  async fetchCommitFiles({
    commit_id,
    path,
    depth,
  }: {
    commit_id: string;
    path: string;
    depth?: number;
  }) {
    const result = await this.repositoryServiceClient.get(
      "/commits/{commit_id}/files",
      {
        params: {
          path: {
            commit_id,
          },
          query: {
            path,
            depth,
          } as any,
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }
    if (result.data) {
      result.data.map((data) => this.commitFileStore.push(data));
    }
  }
  async fetchCommitFileContent(file_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/commit-files/{file_id}/content",
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

    this.commitFileStore.instance(file_id)?.setContent(result.data || "");
  }

  // Tag

  async fetchTag(tag_id: string) {
    const result = await this.repositoryServiceClient.get(
      "/repository-tags/{tag_id}",
      {
        params: {
          path: {
            tag_id,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.tagStore.push(result.data);
    }
  }
  async createTag(tag: {
    repository_id: string;
    name: string;
    commit_id: string;
  }) {
    const result = await this.repositoryServiceClient.post("/repository-tags", {
      body: {
        repository_id: tag.repository_id,
        name: tag.name,
        commit_id: tag.commit_id,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    return this.tagStore.push(result.data!);
  }
  async deleteTag(tag_id: string) {
    const result = await this.repositoryServiceClient.delete(
      "/repository-tags/{tag_id}",
      {
        params: {
          path: {
            tag_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this.tagStore.remove(tag_id);
  }
}

export const repositoryServiceFactory = createConstructorFactory(
  RepositoryService,
  {
    name: "repository-service",
  },
);
