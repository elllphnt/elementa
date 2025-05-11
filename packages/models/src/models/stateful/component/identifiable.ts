import { IdentifiableData } from "@elllphnt/elementa-base";
import {
  Extendable,
  ReactiveMap,
  attachReactiveMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { init } from "@paralleldrive/cuid2";
import * as y from "yjs";

export type Identifiable<S extends IdentifiableData> = ReactiveMap<S> & {
  id: string;
  cloneIds(clone: y.Map<any>): void;
  cloneOwnId(clone: y.Map<any>): void;
  cloneState(): y.Map<any>;
};

export function attachIdentifiable<S extends IdentifiableData>(
  ymap: y.Map<any>
): ymap is Identifiable<S> {
  if (!attachReactiveMap<S>(ymap as Extendable<y.Map<any>>)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const identifiable = ymap as Identifiable<S>;

  if (!identifiable.doc || (identifiable.doc && !identifiable.get("id"))) {
    identifiable.set("id", Identifiable.createId() as any);
  }

  Object.defineProperty(identifiable, "id", {
    get() {
      return identifiable.get("id");
    },
  });

  identifiable.cloneIds = (clone: y.Map<any>) => {
    identifiable.cloneOwnId(clone);
  };

  identifiable.cloneOwnId = (clone: y.Map<any>) => {
    clone.set("id", Identifiable.createId());
  };

  setEnhancer(identifiable, attachIdentifiable);
  return true;
}

export function createIdentifiable<
  S extends IdentifiableData
>(): Identifiable<S> {
  const ymap = new y.Map<any>();
  if (!attachIdentifiable<S>(ymap)) {
    throw new Error("Failed to create Identifiable");
  }
  return ymap as Identifiable<S>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Identifiable {
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
