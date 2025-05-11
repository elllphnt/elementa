import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import {
  attachReactiveList,
  ReactiveList,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { genId } from "../../_lib/id.js";

export type StyleFragmentRegistry = ReactiveList<StyleFragmentData> & {
  fragment<T extends StyleFragmentType>(
    type: T,
    id: string
  ): StyleFragmentData<T> | undefined;

  fragment$<T extends StyleFragmentType>(
    type: T,
    id: string
  ): Observable<StyleFragmentData<T> | undefined>;

  fragments<T extends StyleFragmentType>(type: T): StyleFragmentData<T>[];
  fragments$<T extends StyleFragmentType>(
    type: T
  ): Observable<StyleFragmentData<T>[]>;

  allFragments: StyleFragmentData[];
  allFragments$: Observable<StyleFragmentData[]>;

  addFragment<T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T]
  ): StyleFragmentData<T>;

  setFragmentData<T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ): void;

  removeFragment(id: string): void;
  restore(data: StyleFragmentData[]): void;
};

/**
 * Attach StyleFragmentRegistry behavior to a y.Array
 */
export function attachStyleFragmentRegistry(
  yarray: y.Array<any>
): yarray is StyleFragmentRegistry {
  if (!attachReactiveList<StyleFragmentData>(yarray)) {
    throw new Error("Failed to attach reactive list to yarray");
  }
  const registry = yarray as StyleFragmentRegistry;

  const _fragmentsById$ = new BehaviorSubject<
    Record<string, StyleFragmentData>
  >({});

  const sub = registry.items$
    .pipe(map((arr) => Object.fromEntries(arr.map((f) => [f.id, f]))))
    .subscribe(_fragmentsById$);

  registry.fragment = function <T extends StyleFragmentType>(
    type: T,
    id: string
  ) {
    const frag = _fragmentsById$.value[id];
    return frag?.type === type ? (frag as StyleFragmentData<T>) : undefined;
  };

  registry.fragment$ = function <T extends StyleFragmentType>(
    type: T,
    id: string
  ) {
    return _fragmentsById$.pipe(
      map((frags) => {
        const frag = frags[id];
        return frag?.type === type ? (frag as StyleFragmentData<T>) : undefined;
      }),
      distinctUntilChanged()
    );
  };

  registry.fragments = function <T extends StyleFragmentType>(type: T) {
    return registry
      .toArray()
      .filter((f) => f.type === type) as StyleFragmentData<T>[];
  };

  registry.fragments$ = function <T extends StyleFragmentType>(type: T) {
    return registry.items$.pipe(
      map((arr) => arr.filter((f) => f.type === type) as StyleFragmentData<T>[])
    );
  };

  registry.allFragments$ = registry.items$;

  registry.addFragment = function <T extends StyleFragmentType>(
    type: T,
    data: StyleFragmentDataTypeMap[T]
  ) {
    const fragment: StyleFragmentData<T> = { id: genId(), type, data };
    registry.push([fragment]);
    return fragment;
  };

  registry.setFragmentData = function <T extends StyleFragmentType>(
    id: string,
    data: StyleFragmentDataTypeMap[T]
  ) {
    const idx = registry.toArray().findIndex((f) => f.id === id);
    if (idx >= 0) {
      const updated = { ...registry.toArray()[idx], data };
      registry.doc?.transact(() => {
        registry.delete(idx);
        registry.insert(idx, [updated]);
      });
    }
  };

  registry.removeFragment = function (id: string) {
    const idx = registry.toArray().findIndex((f) => f.id === id);
    if (idx >= 0) {
      registry.delete(idx);
    }
  };

  const baseDispose = (registry as any).dispose?.bind(registry);
  registry.dispose = () => {
    sub.unsubscribe();
    if (baseDispose) baseDispose();
  };

  setEnhancer(registry, attachStyleFragmentRegistry);
  return true;
}

/**
 * Create a new local StyleFragmentRegistry
 */
export function createStyleFragmentRegistry(): StyleFragmentRegistry {
  const yarray = new y.Array<any>();
  if (!attachStyleFragmentRegistry(yarray)) {
    throw new Error("Failed to create StyleFragmentRegistry");
  }
  return yarray as StyleFragmentRegistry;
}
