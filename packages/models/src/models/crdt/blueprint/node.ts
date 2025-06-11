import { ensureField } from "@elllphnt/crdt";
import { BlueprintNode } from "@elllphnt/elementa-core";
import { CrdtRecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtIdentifiable } from "../_shared/identifiable.js";

export class CrdtBlueprintNode
  extends CrdtIdentifiable
  implements BlueprintNode
{
  private _state: CrdtRecordState<{
    id: string;
    position: { x: number; y: number };
  }>;

  constructor(
    crdt: y.Map<any>,
    { initialized }: { initialized?: boolean } = {}
  ) {
    super({ crdt, initialized });

    if (!initialized) {
      ensureField(crdt, "position", () => ({ x: 0, y: 0 }));
    }
    ensureField(crdt, "__crdtAtomic", () => ["position"]);
    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => this._state.dispose());
  }

  get id(): string {
    return this._state.entry("id");
  }

  get position(): { x: number; y: number } {
    return this._state.entry("position");
  }

  get position$(): Observable<{ x: number; y: number }> {
    return this._state.entry$("position");
  }

  setPosition(pos: { x: number; y: number }) {
    this._state.set("position", pos);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtBlueprintNode(crdt, { initialized: true }) as this;
  }
}
