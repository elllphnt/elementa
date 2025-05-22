import { StaticReference, StyleSheetData } from "@elllphnt/elementa-base";
import { NameOptions } from "../libs/_.js";
import { TranspilerDiagnostic } from "./diagnostic.js";
import { Environment } from "./environment.js";
import { Module } from "./module.js";
import { TranspilerReference } from "./reference.js";
import { TranspilerRoute } from "./route.js";
import { TranspilerStylesheet } from "./stylesheet.js";

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
