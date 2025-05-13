import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { Diagnostic, Diagnosticable, DiagnosticLevel } from "../_shared/_.js";
import { Runtime } from "../runtime/runtime.js";

/**
 * Enumerates all runtime instance types in the Elll execution model.
 * These are used for identification, traversal, inspection, and key generation.
 */
export enum ElementaInstanceType {
  App = "app",
  Route = "route",
  RouteHandler = "route-handler",
  Component = "component",
  Fragment = "fragment",
  Element = "element",
  Slot = "slot",
  State = "state",
  StyleSheet = "stylesheet",
  Style = "style",
}

/**
 * Base runtime class for all reactive, disposable, and traversable instances.
 * Includes a stable key, a parent link, and a type identifier.
 */
export abstract class Instance extends Disposable implements Diagnosticable {
  readonly key: string;
  readonly type: string;
  readonly runtime: Runtime;
  readonly parent?: Instance;

  private _diagnostics = new BehaviorSubject<Record<string, Diagnostic>>({});

  get diagnostics(): Diagnostic[] {
    return Object.values(this._diagnostics.getValue());
  }
  get diagnostics$(): Observable<Diagnostic[]> {
    return this._diagnostics.asObservable().pipe(map((d) => Object.values(d)));
  }

  get ownDiagnosticLevel(): number {
    return Math.max(0, ...this.diagnostics.map((d) => d.level));
  }
  get ownDiagnosticLevel$(): Observable<number> {
    return this.diagnostics$.pipe(
      map((d) => Math.max(0, ...d.map((d) => d.level)))
    );
  }

  get diagnosticLevel(): number {
    return DiagnosticLevel.Info;
  }
  get diagnosticLevel$(): Observable<number> {
    return of(DiagnosticLevel.Info);
  }

  constructor({
    type,
    runtime,
    parent,
  }: {
    type: string;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super();
    this.type = type;
    this.key = keyManager.next(type + "-instance");
    this.runtime = runtime;
    this.parent = parent;
  }

  setDiagnostic(key: string, diagnostic: Diagnostic) {
    this._diagnostics.next({
      ...this._diagnostics.getValue(),
      [key]: {
        ...diagnostic,
      },
    });
  }
  clearDiagnostic(key: string) {
    const currentDiagnostics = { ...this._diagnostics.getValue() };
    delete currentDiagnostics[key];
    this._diagnostics.next(currentDiagnostics);
  }
}
