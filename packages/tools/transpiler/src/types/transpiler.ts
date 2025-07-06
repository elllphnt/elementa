import type { StaticReference, StyleSheetData } from "@elllphnt/elementa-base";
import type { NameOptions } from "../libs/_.js";
import type { TranspilerDiagnostic } from "./diagnostic.js";
import type { Environment } from "./environment.js";
import type { Module } from "./module.js";
import type { TranspilerReference } from "./reference.js";
import type { TranspilerRoute } from "./route.js";
import type { TranspilerStylesheet } from "./stylesheet.js";

export type TranspilerContext = {
  useModule(options: {
    url: string;
    specifier?: string;
    name?: NameOptions;
  }): Module;
  useStyleSheet(data: StyleSheetData): TranspilerStylesheet;
  useReference(reference: StaticReference): TranspilerReference;
  useRoute(url: string): TranspilerRoute;
  addDiagnostic(diagnostic: TranspilerDiagnostic): void;
};

export type TranspilerResult<A extends any[] = []> = {
  generate: (env: Environment, ...args: A) => string;
};
