export function updateMapList<S, T>({
  targets,
  sources,
  ref,
  create,
  dispose,
}: {
  targets: T[];
  sources: S[];
  ref: (target: T) => S;
  create: (source: S) => T;
  dispose?: (target: T) => void;
}): T[] {
  const map = new Map(targets.map((target) => [ref(target), target]));
  const newTargets: T[] = [];

  for (const source of sources) {
    const target = map.get(source);

    if (target) {
      newTargets.push(target);
      map.delete(source);
    } else {
      newTargets.push(create(source));
    }
  }

  if (dispose) {
    for (const target of map.values()) {
      dispose?.(target);
    }
  }

  return newTargets;
}
