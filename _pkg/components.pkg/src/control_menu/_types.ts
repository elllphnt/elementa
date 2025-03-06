import { Context } from "react";

export type ControlMenu = {
  key?: string;
  title?: string;
  viewId: string;
  props?: Record<string, any>;
};

export type ControlMenuOptions = ControlMenu & {
  anchor?: HTMLElement;
  affinity?: "workspace" | "side";
  contexts?: [Context<any>, any][];
};
