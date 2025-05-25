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
}

export type CrdtOf<M> = M extends CrdtModel<infer T> ? T : never;
