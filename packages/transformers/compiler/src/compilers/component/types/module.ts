import type { NameOptions } from "../libs/utils/namespace.js";

export type Module = {
  key: number;
  url: string;
  specifier?: string;
  name?: NameOptions;
};
