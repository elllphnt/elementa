import { Context } from "react";

export type Menu = {
  key?: string;
  title?: string;
  viewId: string;
  props?: Record<string, any>;
  width?: number;
  height?: number;
};

export type MenuOptions = Menu & {
  anchor?: HTMLElement;
  contexts?: [Context<any>, any][];
};
