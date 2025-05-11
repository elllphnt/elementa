import { Reference } from "@elllphnt/elll-element";
import { NameOptions } from "../libs/_.js";
import { Environment } from "../libs/_env.js";
import { Dependency } from "./dependency.js";
import { TranspilerReference } from "./reference.js";

export type TranspilerContext = {
  useDependency(options: {
    url: string;
    specifier?: string;
    name?: NameOptions;
  }): Dependency;
  useReference(reference: Reference): TranspilerReference;
  getDependencies(): Dependency[];
  getReferences(): TranspilerReference[];
};

export type TranspilerResult = {
  generate: (env: Environment) => string;
};
