export type FeatureData = {
  id: string;
  name?: string;
  description?: string;
};

export type DomainData = {
  id: string;
  name?: string;
  description?: string;
};

export type SpecData = {
  type?: string;
  description?: string;
  features?: FeatureData[];
  domains?: DomainData[];
  featuresByDomain?: Record<string, string[]>;
};
