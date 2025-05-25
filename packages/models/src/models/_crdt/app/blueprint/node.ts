import { CrdtRecordState, ensureField } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { BlueprintNode } from "~/models/_.js";
import { CrdtIdentifiableModel } from "../../_shared/identifiable.js";

export class CrdtBlueprintNode
  extends CrdtIdentifiableModel
  implements BlueprintNode
{
  private _state: CrdtRecordState<{
    id: string;
    position: { x: number; y: number };
  }>;

  constructor(crdt: y.Map<any>, { id }: { id?: string } = {}) {
    super({ crdt, id });

    ensureField(crdt, "position", () => ({ x: 0, y: 0 }));
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
}
