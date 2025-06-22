import { updateYArray, updateYMap } from "@elllphnt/crdt";
import * as y from "yjs";
import { Disposable } from "../../core/disposable.js";
import { keyManager } from "../../core/key.js";

export abstract class CrdtModel<
  T extends y.AbstractType<any>
> extends Disposable {
  readonly key: string;
  readonly crdt: T;

  constructor({ key, crdt }: { crdt: T; key?: string }) {
    super();
    this.crdt = crdt;
    this.key = key ?? keyManager.next("crdt-model");
  }

  clone(): this {
    const data = this.crdt.toJSON();
    let type: T;
    if (this.crdt instanceof y.Array) {
      type = new y.Array() as any;
      updateYArray(type as any, data);
    } else {
      type = new y.Map() as any;
      updateYMap(type as any, data);
    }
    return this.factory(type);
  }
  protected abstract factory(crdt: T): this;
}

export type CrdtOf<M> = M extends CrdtModel<infer T> ? T : never;
