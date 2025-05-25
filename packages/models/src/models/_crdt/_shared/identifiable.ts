import { CrdtModel, ensureField } from "@elllphnt/elementa-utils";
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
    id,
  }: {
    crdt: y.Map<any>;
    key?: string;
    id?: string;
  }) {
    super({ key, crdt });

    ensureField(crdt, "id", () => id || genId());
  }
}
