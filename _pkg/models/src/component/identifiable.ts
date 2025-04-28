import { IdentifiableData } from "@elllphnt/elementa-base";
import { Extendable, attachReactiveMap } from "@elllphnt/elementa-utils";
import { init } from "@paralleldrive/cuid2";
import * as y from "yjs";

export type IdentifiableModelType<S extends IdentifiableData> = ReturnType<
  typeof attachReactiveMap<S>
> & {
  id: string;
  cloneIds(clone: y.Map<any>): void;
  cloneState(): y.Map<any>;
};

/**
 * Attach IdentifiableModel behavior to a y.Map
 */
export function withIdentifiableModelBehavior<S extends IdentifiableData>(
  ymap: y.Map<any>
): IdentifiableModelType<S> {
  const identifiable = attachReactiveMap<S>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<IdentifiableModelType<S>>;

  // Auto-generate ID if missing
  if (!identifiable.value.id) {
    identifiable.set("id", IdentifiableModel.createId() as any);
  }

  // Native ID accessor
  Object.defineProperty(identifiable, "id", {
    get() {
      return identifiable.value.id;
    },
    set(value: string) {
      identifiable.set("id", value as any);
    },
  });

  // Clone this model's ID into a clone
  identifiable.cloneIds = (clone: y.Map<any>) => {
    clone.set("id", IdentifiableModel.createId());
  };

  // Clone full CRDT state + fresh IDs
  identifiable.cloneState = () => {
    const clone = identifiable.ymap.clone();
    identifiable.cloneIds(clone);
    return clone;
  };

  return identifiable as IdentifiableModelType<S>;
}

/**
 * Create a new local IdentifiableModel
 */
export function createIdentifiableModel<
  S extends IdentifiableData
>(): IdentifiableModelType<S> {
  const ymap = new y.Map<any>();
  return withIdentifiableModelBehavior<S>(ymap);
}

/**
 * Static helpers for cloning list and map of identifiables
 */
export namespace IdentifiableModel {
  export const createId = init();

  export function cloneIdentifiableListIds(
    identifiables: { cloneIds(clone: y.Map<any>): void }[],
    yarray: y.Array<y.Map<any>>
  ): void {
    identifiables.forEach((identifiable, index) => {
      const clone = yarray.get(index);
      if (clone) {
        identifiable.cloneIds(clone);
      }
    });
  }

  export function cloneIdentifiableMapIds(
    identifiables: Record<string, { cloneIds(clone: y.Map<any>): void }>,
    ymap: y.Map<y.Map<any>>
  ): void {
    Object.entries(identifiables).forEach(([key, identifiable]) => {
      const clone = ymap.get(key);
      if (clone) {
        identifiable.cloneIds(clone);
      }
    });
  }
}
