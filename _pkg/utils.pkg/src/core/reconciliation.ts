// utils.pkg/src/core/reconciliation.ts

/**
 * Synchronize a list of target items with a new list of source items.
 *
 * For each source in `sources`, if there is an existing target in `targets`
 * whose `targetRef(target)` matches `sourceRef(source)`, it is retained.
 * Otherwise a new target is created via `create(source)`.
 * Any leftover targets are disposed via the optional `dispose` callback.
 *
 * @typeParam S - Source item type
 * @typeParam T - Target item type
 * @typeParam R - Reference key type used for matching
 *
 * @param params.targets - Existing list of targets
 * @param params.sources - New list of sources
 * @param params.sourceRef - Function mapping a source to its reference key
 * @param params.targetRef - Function mapping a target to its reference key
 * @param params.create - Factory to create a target from a source
 * @param params.dispose - Optional callback to dispose an unmatched target
 *
 * @returns The updated list of targets, in the same order as `sources`.
 */
export function reconcileList<S, T, R>(params: {
  targets: T[];
  sources: S[];
  sourceRef: (source: S) => R;
  targetRef: (target: T) => R;
  create: (source: S) => T;
  dispose?: (target: T) => void;
}): T[] {
  const { targets, sources, sourceRef, targetRef, create, dispose } = params;

  // Build lookup map of existing targets by reference key
  const map = new Map<R, T>();
  for (const t of targets) {
    map.set(targetRef(t), t);
  }

  // Preallocate result array to preserve order
  const newTargets = new Array<T>(sources.length);

  // Reconcile each source
  for (let i = 0; i < sources.length; ++i) {
    const src = sources[i];
    const key = sourceRef(src);
    const existing = map.get(key);
    if (existing !== undefined) {
      newTargets[i] = existing;
      map.delete(key);
    } else {
      newTargets[i] = create(src);
    }
  }

  // Dispose any leftover targets
  if (dispose) {
    map.forEach(dispose);
  }

  return newTargets;
}

/**
 * Synchronize a record of target items with a new record of source items.
 *
 * For each entry in `sources`, if there is an existing target in `targets`
 * under the same key, it is restored via `restore(target, source)`.
 * Otherwise a new target is created via `create(source)`.
 * Any leftover targets not present in `sources` are disposed via the optional `dispose` callback.
 *
 * @typeParam S - Source item type
 * @typeParam T - Target item type
 *
 * @param params.targets - Existing record of targets
 * @param params.sources - New record of sources
 * @param params.create - Factory to create a target from a source
 * @param params.restore - Function to restore an existing target with new source
 * @param params.dispose - Optional callback to dispose an unmatched target
 *
 * @returns A new record of targets matching the keys of `sources`.
 */
export function reconcileMap<S, T>(params: {
  targets: Record<string, T>;
  sources: Record<string, S>;
  create: (source: S) => T;
  restore: (target: T, source: S) => void;
  dispose?: (target: T) => void;
}): Record<string, T> {
  const { targets, sources, create, restore, dispose } = params;

  // Copy of current targets to track disposals
  const leftovers: Record<string, T> = { ...targets };
  const result: Record<string, T> = {} as Record<string, T>;

  // Reconcile each source entry
  for (const key in sources) {
    const src = sources[key];
    const existing = targets[key];
    if (existing !== undefined) {
      // Restore existing target
      restore(existing, src);
      result[key] = existing;
      delete leftovers[key];
    } else {
      // Create new target
      const next = create(src);
      restore(next, src);
      result[key] = next;
    }
  }

  // Dispose any leftover targets
  if (dispose) {
    for (const key in leftovers) {
      dispose(leftovers[key]);
    }
  }

  return result;
}
