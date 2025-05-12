import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Runtime } from "../runtime/runtime.js";

/**
 * Enumerates all runtime instance types in the Elll execution model.
 * These are used for identification, traversal, inspection, and key generation.
 */
export enum ElementaInstanceType {
  App = "app",
  Route = "route",
  Component = "component",
  Fragment = "fragment",
  Element = "element",
  Slot = "slot",
  State = "state",
  StyleSheet = "stylesheet",
  Style = "style",
}

export const DiagnosticLevel = {
  Info: 0,
  Warning: 1,
  Error: 2,
};

export interface Diagnostic {
  level: number;
  message: string;
}

/**
 * Base runtime class for all reactive, disposable, and traversable instances.
 * Includes a stable key, a parent link, and a type identifier.
 */
export abstract class Instance extends Disposable {
  readonly key: string;
  readonly type: string;
  readonly runtime: Runtime;
  readonly parent?: Instance;

  get diagnostics(): Diagnostic[] {
    return [];
  }
  get diagnostics$(): Observable<Diagnostic[]> {
    return of([]);
  }

  get ownDiagnosticLevel(): number {
    return DiagnosticLevel.Info;
  }
  get ownDiagnosticLevel$(): Observable<number> {
    return of(DiagnosticLevel.Info);
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
}
