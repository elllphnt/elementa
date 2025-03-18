export interface Config {
  version: string;
  root: string;
  repositoryId: string;
  resources?: ResourceConfig[];
  storage: {
    root: string;
    baseUrl?: string;
  };
}

export interface ResourceConfig {
  url: string;
  path?: string;
  details?: string;
}
