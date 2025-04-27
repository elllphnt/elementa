import { IdentifiableData } from "@elllphnt/elementa-base";
import { CRDTModel } from "@elllphnt/elementa-utils";
import { init } from "@paralleldrive/cuid2";
import * as y from "yjs";

export abstract class IdentifiableModel<
  S extends IdentifiableData
> extends CRDTModel<S> {
  static createId() {
    return init();
  }
  static cloneIdentifiableListIds(
    identifiables: { cloneIds(clone: y.Map<any>): void }[],
    yarray: y.Array<y.Map<any>>
  ) {
    identifiables.forEach((identifiable, index) => {
      const clone = yarray.get(index);
      if (clone) {
        identifiable.cloneIds(clone);
      }
    });
  }
  static cloneIdentifiableMapIds(
    identifiables: Record<string, { cloneIds(clone: y.Map<any>): void }>,
    ymap: y.Map<y.Map<any>>
  ) {
    Object.entries(identifiables).forEach(([key, identifiable]) => {
      const clone = ymap.get(key);
      if (clone) {
        identifiable.cloneIds(clone);
      }
    });
  }

  get id(): string {
    return this.state.id;
  }

  constructor(ymap: y.Map<any>) {
    super(ymap);

    if (!this.id) {
      this.ymap.set("id", IdentifiableModel.createId());
    }
  }

  protected cloneOwnId(clone: y.Map<any>) {
    clone.set("id", IdentifiableModel.createId());
  }

  abstract cloneIds(clone: y.Map<any>): void;

  cloneState() {
    const clone = this.ymap.clone();
    this.cloneIds(clone);
    return clone;
  }
}
