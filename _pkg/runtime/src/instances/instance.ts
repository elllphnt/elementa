import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { Runtime } from "../runtime/runtime";

/**
 * Enumerates all runtime instance types in the Elll execution model.
 * These are used for identification, traversal, inspection, and key generation.
 */
export enum InstanceType {
  App = 0,
  Route = 1,
  Component = 2,
  Fragment = 3,
  Element = 4,
  Slot = 5,
  State = 6,
  StyleSheet = 7,
  Style = 8,
}

/**
 * Resolves a human-readable name from an InstanceType enum value.
 * Used for debugging, devtools, and key generation.
 */
export function resolveInstanceTypeName(type: InstanceType): string {
  return InstanceType[type]?.toLowerCase() ?? "unknown";
}

/**
 * Base runtime class for all reactive, disposable, and traversable instances.
 * Includes a stable key, a parent link, and a type identifier.
 */
export abstract class Instance extends Disposable {
  readonly key: string;
  readonly type: InstanceType;
  readonly runtime: Runtime;
  readonly parent?: Instance;

  constructor({
    type,
    runtime,
    parent,
  }: {
    type: InstanceType;
    runtime: Runtime;
    parent?: Instance;
  }) {
    super();
    this.type = type;
    this.key = keyManager.next(resolveInstanceTypeName(type) + "-instance");
    this.runtime = runtime;
    this.parent = parent;
  }
}
