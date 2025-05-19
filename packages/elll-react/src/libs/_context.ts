import { TranspilerDiagnostic } from "~/types/diagnostic.js";
import { TranspilerRoute } from "~/types/route.js";
import { TranspilerStylesheet } from "~/types/stylesheet.js";
import { Dependency } from "../types/dependency.js";
import { TranspilerReference } from "../types/reference.js";
import { TranspilerContext } from "../types/transpiler.js";

let dependencyKey = 0;
let stylesheetKey = 0;
let referenceKey = 0;
let routeKey = 0;

export function createTranspilerContext(): TranspilerContext {
  const dependencies: Map<string, Dependency> = new Map();
  const references: Map<string, TranspilerReference> = new Map();
  const stylesheets: TranspilerStylesheet[] = [];
  const routes: Map<string, TranspilerRoute> = new Map();
  const diagnostics: TranspilerDiagnostic[] = [];

  return {
    // ───── Dependencies ─────
    useDependency({ url, specifier, name }) {
      let dependency = dependencies.get(url);
      if (!dependency) {
        const key = dependencyKey++;
        dependency = { key, url, specifier, name };
        dependencies.set(url, dependency);
      }
      return dependency;
    },
    getDependencies() {
      return Array.from(dependencies.values());
    },

    // ───── Stylesheets ─────
    useStyleSheet(data) {
      const stylesheet: TranspilerStylesheet = {
        key: ++stylesheetKey,
        data,
      };
      stylesheets.push(stylesheet);
      return stylesheet;
    },
    getStyleSheets() {
      return stylesheets;
    },

    // ───── Static References ─────
    useReference(reference) {
      const mapKey = JSON.stringify(reference.__reference);
      let tReference = references.get(mapKey);
      if (!tReference) {
        const key = referenceKey++;
        tReference = {
          key,
          data: reference.__reference,
        };
        references.set(mapKey, tReference);
      }
      return tReference;
    },
    getReferences() {
      return Array.from(references.values());
    },

    // ───── Routes ─────
    useRoute(url: string) {
      let route = routes.get(url);
      if (!route) {
        const key = routeKey++;
        // You can optionally load real path metadata here later
        route = {
          key,
          url,
        };
        routes.set(url, route);
      }
      return route;
    },
    getRoutes() {
      return Array.from(routes.values());
    },

    // ───── Diagnostics ─────
    addDiagnostic(diagnostic) {
      diagnostics.push(diagnostic);
    },
    getDiagnostics() {
      return diagnostics;
    },
  };
}
