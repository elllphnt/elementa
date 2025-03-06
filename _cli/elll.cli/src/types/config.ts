export interface Config {
  version: string;
  root: string;
  repositoryId: string;
  resources?: ResourceConfig[];
}

export interface ResourceConfig {
  url: string;
  path?: string;
  details?: string;
}
