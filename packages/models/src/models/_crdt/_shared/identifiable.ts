import { ensureField } from "@elllphnt/crdt";
import { CrdtModel } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { genId } from "~/_lib/id.js";
import { Identifiable } from "../../_interfaces/_shared/identifiable.js";

export abstract class CrdtIdentifiableModel
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
