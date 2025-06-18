import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import { ElementaFrameData, ElementaStageData } from "@elllphnt/elementa-base";
import {
  ElementaEnvironment,
  ElementaFrame,
  ElementaStage,
  genId,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtElementaFrame } from "./frame.js";

export class CrdtElementaStage
  extends CrdtModel<y.Map<any>>
  implements ElementaStage
{
  readonly environment: ElementaEnvironment;

  private _state: CrdtRecordState<Omit<ElementaStageData, "frames">>;
  private _frames: AggregatedCrdtModelList<CrdtElementaFrame>;

  get frames(): CrdtElementaFrame[] {
    return this._frames.models;
  }

  get frames$(): Observable<CrdtElementaFrame[]> {
    return this._frames.models$;
  }

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementaEnvironment;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("elementa-stage"), crdt });

    this.environment = environment;

    if (!initialized) {
      ensureField(crdt, "frames", () => new y.Array());
    }

    this._state = new CrdtRecordState(crdt);

    this._frames = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "frames"),
      create: (crdt, init) =>
        new CrdtElementaFrame({
          crdt,
          stage: this,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._frames.dispose();
    });
  }

  addFrame(data: ElementaFrameData): void {
    const map = new y.Map();
    map.set("id", data.id || genId());
    if (data.name !== undefined) map.set("name", data.name);
    if (data.x !== undefined) map.set("x", data.x);
    if (data.y !== undefined) map.set("y", data.y);
    if (data.height !== undefined) map.set("height", data.height);
    if (data.width !== undefined) map.set("width", data.width);
    if (data.corners !== undefined) map.set("corners", data.corners);
    if (data.context !== undefined) {
      const contextMap = new y.Map();
      // Set context data
      map.set("context", contextMap);
    }
    if (data.content !== undefined) {
      const contentMap = new y.Map();
      contentMap.set("type", data.content.type);
      // Set content data based on type
      map.set("content", contentMap);
    }

    const frame = new CrdtElementaFrame({
      crdt: map,
      stage: this,
      initialized: true,
    });
    this._frames.add([frame]);
  }

  removeFrame(frame: ElementaFrame): void {
    this._frames.remove([frame as CrdtElementaFrame]);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtElementaStage({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
