// utils.pkg/src/core/reconciliation.ts

/**
 * Synchronize a list of target items with a new list of source items.
 *
 * For each source in `sources`:
 * - If there is an existing target in `targets` whose `targetRef(target)` matches
 *   `sourceRef(source)`, it is reconciled via `reconcile(target, source)`.
 * - Otherwise a new target is created via `create(source)` and then reconciled.
 * Any leftover targets are disposed via the optional `dispose` callback.
 *
 * @typeParam S - Source item type
 * @typeParam T - Target item type
 * @typeParam R - Reference key type used for matching
 *
 * @param params.targets    - Existing list of targets
 * @param params.sources    - New list of sources
 * @param params.sourceRef  - Function mapping a source to its reference key
 * @param params.targetRef  - Function mapping a target to its reference key
 * @param params.create     - Factory to create a target from a source
 * @param params.reconcile  - Function to reconcile an existing or new target with a source
 * @param params.dispose?   - Optional callback to dispose an unmatched target
 *
 * @returns The updated list of targets, in the same order as `sources`.
 */
export function reconcileList<S, T, R>(params: {
  targets: T[];
  sources: S[];
  sourceRef: (source: S) => R;
  targetRef: (target: T) => R;
  create: (source: S) => T;
  reconcile: (target: T, source: S) => void;
  dispose?: (target: T) => void;
}): T[] {
  const { targets, sources, sourceRef, targetRef, create, reconcile, dispose } =
    params;

  const map = new Map<R, T>();
  for (const t of targets) {
    map.set(targetRef(t), t);
  }

  const newTargets = new Array<T>(sources.length);

  for (let i = 0; i < sources.length; ++i) {
    const src = sources[i];
    const key = sourceRef(src);
    const existing = map.get(key);

    if (existing !== undefined) {
      // reconcile existing
      reconcile(existing, src);
      newTargets[i] = existing;
      map.delete(key);
    } else {
      // create + reconcile new
      const next = create(src);
      reconcile(next, src);
      newTargets[i] = next;
    }
  }

  if (dispose) {
    map.forEach(dispose);
  }

  return newTargets;
}

/* reconcileMap remains unchanged, but for reference: */

export function reconcileMap<S, T>(params: {
  targets: Record<string, T>;
  sources: Record<string, S>;
  create: (source: S) => T;
  reconcile: (target: T, source: S) => void;
  dispose?: (target: T) => void;
}): Record<string, T> {
  const { targets, sources, create, reconcile, dispose } = params;

  const leftovers: Record<string, T> = { ...targets };
  const result: Record<string, T> = {} as Record<string, T>;

  for (const key in sources) {
    const src = sources[key];
    const existing = targets[key];
    if (existing !== undefined) {
      reconcile(existing, src);
      result[key] = existing;
      delete leftovers[key];
    } else {
      const next = create(src);
      reconcile(next, src);
      result[key] = next;
    }
  }

  if (dispose) {
    for (const key in leftovers) {
      dispose(leftovers[key]);
    }
  }

  return result;
}
