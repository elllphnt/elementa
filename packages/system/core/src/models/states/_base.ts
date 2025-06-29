import { ensureField } from "@elllphnt/crdt";
import { BaseStateData } from "@elllphnt/elementa-base";
import { BaseState, Component, genId } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export abstract class CrdtBaseState<T extends BaseStateData<string>>
  extends CrdtModel<y.Map<any>>
  implements BaseState<T["type"]>
{
  readonly type: T["type"];
  readonly component: Component;

  protected _state: CrdtRecordState<Omit<T, "id" | "type">>;

  get id(): string {
    return this.crdt.get("id") as string;
  }

  private get _baseState() {
    return this._state as unknown as CrdtRecordState<BaseStateData<T["type"]>>;
  }

  get name(): string | undefined {
    return this._baseState.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this._baseState.entry$("name");
  }

  get varName(): string | undefined {
    return this._baseState.entry("varName");
  }
  get varName$(): Observable<string | undefined> {
    return this._baseState.entry$("varName");
  }

  constructor({
    crdt,
    type,
    component,
    initialized,
  }: {
    crdt: y.Map<any>;
    type: T["type"];
    component: Component;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("state"), crdt });

    this.type = type;
    this.component = component;

    if (!initialized) {
      ensureField(crdt, "id", () => genId());
      ensureField(crdt, "type", () => type);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }
}
