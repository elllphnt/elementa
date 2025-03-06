export type DisplayData = {
  description?: string;
  query?: string;
  featureIds?: string[];
};

export type InteractionData = {
  description?: string;
  command?: string;
  featureIds?: string[];
};

export type LinkData = {
  description?: string;
  viewId?: string;
  featureIds?: string[];
};

export type ComponentData = {
  id: string;
  name?: string;
  description?: string;
  displays?: Record<string, DisplayData>;
  interactions?: Record<string, InteractionData>;
  links?: Record<string, LinkData>;
};

export type ViewData = {
  id: string;
  type?: string;
  name?: string;
  description?: string;
  componentIds?: string[];
};

export type NodeData = {
  x?: number;
  y?: number;
};
export type BoardData = {
  nodes?: Record<string, NodeData>;
};

export type BlueprintData = {
  components?: ComponentData[];
  views?: ViewData[];
  board?: BoardData;
};
