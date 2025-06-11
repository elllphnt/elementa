import { ensureField } from "@elllphnt/crdt";
import { genId, Identifiable } from "@elllphnt/elementa-core";
import { CrdtModel } from "@elllphnt/elementa-utils";
import * as y from "yjs";

export abstract class CrdtIdentifiable
  extends CrdtModel<y.Map<any>>
  implements Identifiable
{
  get id() {
    return this.crdt.get("id") as string;
  }

  constructor({
    crdt,
    key,
    initialized,
  }: {
    crdt: y.Map<any>;
    key?: string;
    initialized?: boolean;
  }) {
    super({ key, crdt });

    if (!initialized) {
      ensureField(crdt, "id", () => genId());
    }
  }
}
