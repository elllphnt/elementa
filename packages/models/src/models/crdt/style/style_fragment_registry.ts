import {
  StyleFragmentData,
  StyleFragmentDataTypeMap,
  StyleFragmentType,
} from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveList,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { genId } from "../../../_lib/id.js";
import { StyleFragmentRegistry } from "../../_interfaces/style/style_fragment_registry.js";

export function attachStyleFragmentRegistry(
  yarray: y.Array<any>
): yarray is y.Array<any> & StyleFragmentRegistry {
  assert(attachReactiveList<StyleFragmentData>(yarray));

  const _fragmentsById$ = new BehaviorSubject<
    Record<string, StyleFragmentData>
  >({});

  const sub = yarray.items$
    .pipe(map((arr) => Object.fromEntries(arr.map((f) => [f.id, f]))))
    .subscribe(_fragmentsById$);

  assert(
    setObjectProperty(
      yarray,
      "fragment",
      <T extends StyleFragmentType>(type: T, id: string) => {
        const frag = _fragmentsById$.value[id];
        return frag?.type === type ? (frag as StyleFragmentData<T>) : undefined;
      }
    )
  );

  assert(
    setObjectProperty(
      yarray,
      "fragment$",
      <T extends StyleFragmentType>(type: T, id: string) => {
        return _fragmentsById$.pipe(
          map((frags) => {
            const frag = frags[id];
            return frag?.type === type
              ? (frag as StyleFragmentData<T>)
              : undefined;
          }),
          distinctUntilChanged()
        );
      }
    )
  );

  assert(
    setObjectProperty(
      yarray,
      "fragments",
      <T extends StyleFragmentType>(type: T) => {
        return yarray
          .toArray()
          .filter((f) => f.type === type) as StyleFragmentData<T>[];
      }
    )
  );

  assert(
    setObjectProperty(
      yarray,
      "fragments$",
      <T extends StyleFragmentType>(type: T) => {
        return yarray.items$.pipe(
          map(
            (arr) =>
              arr.filter((f) => f.type === type) as StyleFragmentData<T>[]
          )
        );
      }
    )
  );

  assert(setObjectProperty(yarray, "allFragments$", yarray.items$));
  assert(setObjectGetter(yarray, "allFragments", () => yarray.items));

  assert(
    setObjectProperty(
      yarray,
      "addFragment",
      <T extends StyleFragmentType>(
        type: T,
        data: StyleFragmentDataTypeMap[T]
      ) => {
        const fragment: StyleFragmentData<T> = { id: genId(), type, data };
        yarray.push([fragment]);
        return fragment;
      }
    )
  );

  assert(
    setObjectProperty(
      yarray,
      "setFragmentData",
      <T extends StyleFragmentType>(
        id: string,
        data: StyleFragmentDataTypeMap[T]
      ) => {
        const idx = yarray.toArray().findIndex((f) => f.id === id);
        if (idx >= 0) {
          const updated = { ...yarray.toArray()[idx], data };
          yarray.doc?.transact(() => {
            yarray.delete(idx);
            yarray.insert(idx, [updated]);
          });
        }
      }
    )
  );

  assert(
    setObjectProperty(yarray, "removeFragment", (id: string) => {
      const idx = yarray.toArray().findIndex((f) => f.id === id);
      if (idx >= 0) {
        yarray.delete(idx);
      }
    })
  );

  assert(
    setObjectProperty(yarray, "restore", (data: StyleFragmentData[]) => {
      yarray.doc?.transact(() => {
        yarray.delete(0, yarray.length);
        yarray.insert(0, data);
      });
    })
  );

  const baseDispose = (yarray as any).dispose?.bind(yarray);
  (yarray as any).dispose = () => {
    sub.unsubscribe();
    _fragmentsById$.complete();
    if (baseDispose) baseDispose();
  };

  return setEnhancer<StyleFragmentRegistry>(
    yarray,
    attachStyleFragmentRegistry
  );
}
