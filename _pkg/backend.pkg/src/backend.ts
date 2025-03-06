import { TokenManager } from "@elllphnt/elll-client";
import {
  configurationServiceClientFactory,
  identityServiceClientFactory,
  intelligenceServiceClientFactory,
  repositoryServiceClientFactory,
  workspaceServiceClientFactory,
} from "./clients";
import { Backend } from "./lib/backend";
import { Commit } from "./resources/commit";
import { CommitFile } from "./resources/commit_file";
import { Configuration } from "./resources/configuration";
import { IntelligenceThread } from "./resources/intelligence_thread";
import { IntelligenceMessage } from "./resources/intelligence_thread_message";
import { Repository } from "./resources/repository";
import { RepositoryTag } from "./resources/repository_tag";
import { Tenant } from "./resources/tenant";
import { User } from "./resources/user";
import { Workspace } from "./resources/workspace";
import { WorkspaceFile } from "./resources/workspace_file";
import { configurationServiceFactory } from "./services/configuration_service";
import { identityServiceFactory } from "./services/identity_service";
import { intelligenceServiceFactory } from "./services/intelligence_service";
import { repositoryServiceFactory } from "./services/repository_service";
import { workspaceServiceFactory } from "./services/workspace_service";
import { Syncer } from "./syncer";

export class ElllBackend extends Backend {
  readonly syncer: Syncer;

  constructor({
    elllephantApiBaseUrl,
    elllephantApiTokenManager,
  }: {
    elllephantApiBaseUrl: string;
    elllephantApiTokenManager: TokenManager;
  }) {
    super();

    this.setProperty("elllephantApiBaseUrl", elllephantApiBaseUrl);
    this.setProperty("elllephantApiTokenManager", elllephantApiTokenManager);

    this.syncer = new Syncer({ baseUrl: elllephantApiBaseUrl, backend: this });
    Syncer.setInstance(this, this.syncer);

    // clients

    this.addClient(identityServiceClientFactory);
    this.addClient(workspaceServiceClientFactory);
    this.addClient(intelligenceServiceClientFactory);
    this.addClient(configurationServiceClientFactory);
    this.addClient(repositoryServiceClientFactory);

    // services

    this.addService(identityServiceFactory);
    this.addService(workspaceServiceFactory);
    this.addService(intelligenceServiceFactory);
    this.addService(configurationServiceFactory);
    this.addService(repositoryServiceFactory);

    // stores

    this.addStore(User);
    this.addStore(Tenant);
    this.addStore(Workspace);
    this.addStore(WorkspaceFile);
    this.addStore(IntelligenceThread);
    this.addStore(IntelligenceMessage);
    this.addStore(Configuration);
    this.addStore(Repository);
    this.addStore(Commit);
    this.addStore(CommitFile);
    this.addStore(RepositoryTag);

    // sync
    this.syncer.init();
  }
}
