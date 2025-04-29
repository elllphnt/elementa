import { Disposable } from "@elllphnt/elementa-utils";
import { Elementa } from "../elementa";

export abstract class Instance extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${Instance.keySeed}-${Instance.key++}`;

  readonly elementa: Elementa;

  constructor(elementa: Elementa) {
    super();
    this.elementa = elementa;
  }
}
