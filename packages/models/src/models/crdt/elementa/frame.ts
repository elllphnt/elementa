import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import { CornerData, ElementaFrameData } from "@elllphnt/elementa-base";
import { ElementaFrame, ElementaStage } from "@elllphnt/elementa-core";
import {
  CrdtRecordState,
  OptionalCrdtModel,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtIdentifiable } from "../_shared/identifiable.js";
import {
  CrdtRenderableContent,
  CrdtcreateRenderableContent,
} from "./renderable_content/_content.js";
import { CrdtRenderingContext } from "./rendering_context.js";

export class CrdtElementaFrame
  extends CrdtIdentifiable
  implements ElementaFrame
{
  readonly stage: ElementaStage;
  readonly context: CrdtRenderingContext;

  private _state: CrdtRecordState<
    Omit<ElementaFrameData, "id" | "context" | "content">
  >;
  private _content: OptionalCrdtModel<CrdtRenderableContent>;

  get content(): CrdtRenderableContent | undefined {
    return this._content.model;
  }

  get content$(): Observable<CrdtRenderableContent | undefined> {
    return this._content.model$;
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get x(): number | undefined {
    return this._state.entry("x");
  }

  get x$(): Observable<number | undefined> {
    return this._state.entry$("x");
  }

  get y(): number | undefined {
    return this._state.entry("y");
  }

  get y$(): Observable<number | undefined> {
    return this._state.entry$("y");
  }

  get height(): number | undefined {
    return this._state.entry("height");
  }

  get height$(): Observable<number | undefined> {
    return this._state.entry$("height");
  }

  get width(): number | undefined {
    return this._state.entry("width");
  }

  get width$(): Observable<number | undefined> {
    return this._state.entry$("width");
  }

  get corners(): CornerData<number> | undefined {
    return this._state.entry("corners");
  }

  get corners$(): Observable<CornerData<number> | undefined> {
    return this._state.entry$("corners");
  }

  constructor({
    crdt,
    stage,
    initialized,
  }: {
    crdt: y.Map<any>;
    stage: ElementaStage;
    initialized?: boolean;
  }) {
    super({ crdt, key: keyManager.next("elementa-frame"), initialized });

    this.stage = stage;

    if (!initialized) {
      ensureField(crdt, "context", () => new y.Map());
      ensureField(crdt, "__crdtAtomic", () => ["styleModifiers[*]"]);
    }

    const contextMap = getOrCreateYMap(crdt, "context");
    this.context = new CrdtRenderingContext({
      crdt: contextMap,
      initialized,
    });

    this._content = new OptionalCrdtModel<CrdtRenderableContent>({
      crdt,
      create: (crdt, init) =>
        CrdtcreateRenderableContent({
          crdt,
          environment: this.stage.environment,
          initialized: init && initialized,
        }),
    });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
      this.context.dispose();
    });
  }

  setName(name: string | undefined): void {
    this._state.set("name", name);
  }

  setX(x: number | undefined): void {
    this._state.set("x", x);
  }

  setY(y: number | undefined): void {
    this._state.set("y", y);
  }

  setHeight(height: number | undefined): void {
    this._state.set("height", height);
  }

  setWidth(width: number | undefined): void {
    this._state.set("width", width);
  }

  setCorners(corners: CornerData<number> | undefined): void {
    this._state.set("corners", corners);
  }

  remove(): void {
    this.stage.removeFrame(this);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtElementaFrame({
      crdt,
      stage: this.stage,
      initialized: true,
    }) as this;
  }
}
