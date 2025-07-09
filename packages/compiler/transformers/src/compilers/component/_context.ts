import type { StaticReference, StyleSheetData } from "@elllphnt/elementa-base";
import type { TranspilerDiagnostic } from "~/types/diagnostic.js";
import type { TranspilerRoute } from "~/types/route.js";
import type { TranspilerStylesheet } from "~/types/stylesheet.js";
import type { Module } from "./types/module.js";
import type { TranspilerReference } from "./types/reference.js";
import type { TranspilerContext } from "./types/transpiler.js";

export class TranspilerContextImpl implements TranspilerContext {
  private moduleKey = 0;
  private stylesheetKey = 0;
  private referenceKey = 0;
  private routeKey = 0;

  private _modules: Map<string, Module> = new Map();
  private _references: Map<string, TranspilerReference> = new Map();
  private _stylesheets: TranspilerStylesheet[] = [];
  private _routes: Map<string, TranspilerRoute> = new Map();
  private _diagnostics: TranspilerDiagnostic[] = [];

  get modules() {
    return Array.from(this._modules.values());
  }
  get stylesheets() {
    return this._stylesheets;
  }
  get references() {
    return Array.from(this._references.values());
  }
  get routes() {
    return Array.from(this._routes.values());
  }
  get diagnostics() {
    return this._diagnostics;
  }

  // ───── Modules ─────
  useModule({ url, specifier, name }) {
    let module = this._modules.get(url);
    if (!module) {
      const key = this.moduleKey++;
      module = { key, url, specifier, name };
      this._modules.set(url, module);
    }
    return module;
  }

  // ───── Stylesheets ─────
  useStyleSheet(data: StyleSheetData) {
    const stylesheet: TranspilerStylesheet = {
      key: ++this.stylesheetKey,
      data,
    };
    this._stylesheets.push(stylesheet);
    return stylesheet;
  }

  // ───── Static References ─────
  useReference(reference: StaticReference) {
    const mapKey = JSON.stringify(reference.__reference);
    let tReference = this._references.get(mapKey);
    if (!tReference) {
      const key = this.referenceKey++;
      tReference = {
        key,
        data: reference.__reference,
      };
      this._references.set(mapKey, tReference);
    }
    return tReference;
  }

  // ───── Routes ─────
  useRoute(url: string) {
    let route = this._routes.get(url);
    if (!route) {
      const key = this.routeKey++;
      route = {
        key,
        url,
      };
      this._routes.set(url, route);
    }
    return route;
  }

  // ───── Diagnostics ─────
  addDiagnostic(diagnostic: TranspilerDiagnostic) {
    this._diagnostics.push(diagnostic);
  }
}
