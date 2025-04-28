import { IdentifiableData } from "@elllphnt/elementa-base";
import {
  Extendable,
  ReactiveMap,
  attachReactiveMap,
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
): Identifiable<S> {
  const identifiable = attachReactiveMap<S>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<Identifiable<S>>;

  if (!identifiable.value.id) {
    identifiable.set("id", IdentifiableModel.createId() as any);
  }

  Object.defineProperty(identifiable, "id", {
    get() {
      return identifiable.value.id;
    },
  });

  identifiable.cloneIds = (clone: y.Map<any>) => {
    identifiable.cloneOwnId(clone);
  };

  identifiable.cloneOwnId = (clone: y.Map<any>) => {
    clone.set("id", identifiable.id);
  };

  return identifiable as Identifiable<S>;
}

export function createIdentifiableModel<
  S extends IdentifiableData
>(): Identifiable<S> {
  const ymap = new y.Map<any>();
  return attachIdentifiable<S>(ymap);
}

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
