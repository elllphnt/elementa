export type BlueprintNodeData = {
  position: {
    x: number;
    y: number;
  };
};

export type BlueprintAppStateData = {
  nodes: Record<string, BlueprintNodeData>;
};
