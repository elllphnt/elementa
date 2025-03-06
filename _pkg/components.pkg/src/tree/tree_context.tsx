import React from "react";

export const TreeContext = React.createContext<{
  depthOffset: number;
  depth: number;
  depthUnit: number;
}>({
  depth: 0,
  depthOffset: 0,
  depthUnit: 8,
});
