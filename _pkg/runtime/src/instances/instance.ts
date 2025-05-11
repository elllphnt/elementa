import { Disposable, keyManager } from "@elllphnt/elementa-utils";
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

/**
 * Base runtime class for all reactive, disposable, and traversable instances.
 * Includes a stable key, a parent link, and a type identifier.
 */
export abstract class Instance extends Disposable {
  readonly key: string;
  readonly type: string;
  readonly runtime: Runtime;
  readonly parent?: Instance;

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
