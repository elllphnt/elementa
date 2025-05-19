import { StaticReference, StyleSheetData } from "@elllphnt/elementa-base";
import { NameOptions } from "../libs/_.js";
import { Environment } from "../libs/_env.js";
import { Dependency } from "./dependency.js";
import { TranspilerDiagnostic } from "./diagnostic.js";
import { TranspilerReference } from "./reference.js";
import { TranspilerRoute } from "./route.js";
import { TranspilerStylesheet } from "./stylesheet.js";

export type TranspilerContext = {
  // module
  useDependency(options: {
    url: string;
    specifier?: string;
    name?: NameOptions;
  }): Dependency;
  getDependencies(): Dependency[];

  // stylesheet
  useStyleSheet(data: StyleSheetData): TranspilerStylesheet;
  getStyleSheets(): TranspilerStylesheet[];

  // static reference
  useReference(reference: StaticReference): TranspilerReference;
  getReferences(): TranspilerReference[];

  // route
  useRoute(url: string): TranspilerRoute;
  getRoutes(): TranspilerRoute[];

  // diagnostics
  addDiagnostic(diagnostic: TranspilerDiagnostic): void;
  getDiagnostics(): TranspilerDiagnostic[];
};

export type TranspilerResult<A extends any[] = []> = {
  generate: (env: Environment, ...args: A) => string;
};
