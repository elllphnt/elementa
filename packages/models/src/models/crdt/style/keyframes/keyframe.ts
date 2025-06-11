import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import { KeyFrameData } from "@elllphnt/elementa-base";
import {
  Keyframe,
  Project,
  StyleFragmentRegistry,
} from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtStyle } from "../stylesheet/style.js";

export class CrdtKeyframe extends CrdtModel<y.Map<any>> implements Keyframe {
  readonly style: CrdtStyle;

  private _state: CrdtRecordState<Omit<KeyFrameData, "style">>;

  get offset(): number | undefined {
    return this._state.entry("offset");
  }

  get offset$(): Observable<number | undefined> {
    return this._state.entry$("offset");
  }

  constructor({
    crdt,
    project,
    fragmentRegistry,
    initialized,
  }: {
    crdt: y.Map<any>;
    project: Project;
    fragmentRegistry: StyleFragmentRegistry;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("keyframe"), crdt });

    if (!initialized) {
      ensureField(crdt, "style", () => new y.Map());
    }

    this._state = new CrdtRecordState(crdt);

    this.style = new CrdtStyle({
      crdt: getOrCreateYMap(crdt, "style"),
      project,
      fragmentRegistry,
      initialized,
    });

    this.addDisposer(() => {
      this.style.dispose();
      this._state.dispose();
    });
  }

  setOffset(offset: number | undefined): void {
    this._state.set("offset", offset);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtKeyframe({
      crdt,
      project: this.style.project,
      fragmentRegistry: this.style.fragmentRegistry,
      initialized: true,
    }) as this;
  }
}
