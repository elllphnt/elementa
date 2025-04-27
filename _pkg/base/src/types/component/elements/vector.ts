import { Evaluable } from "../../_.js";
import { BaseElementData } from "./_base.js";

export type VectorTextNodeData = {
  type: "text";
  value: string;
};

export type VectorElementNodeData = {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children: VectorNodeData[];
};

export type VectorNodeData = VectorTextNodeData | VectorElementNodeData;

export type VectorElementData = BaseElementData & {
  type: "vector";
  width?: Evaluable<string | number>;
  height?: Evaluable<string | number>;
  viewBox?: Evaluable<string>;
  preserveAspectRatio?: Evaluable<string>;
  content?: VectorNodeData[];
};
