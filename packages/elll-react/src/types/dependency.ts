import { NameOptions } from "../libs/utils/namespace.js";

export type Dependency = {
  key: number;
  url: string;
  specifier?: string;
  name?: NameOptions;
};
