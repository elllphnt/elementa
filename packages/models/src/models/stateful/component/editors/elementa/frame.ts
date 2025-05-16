import { CornerData, ElementaFrameData } from "@elllphnt/elementa-base";
import {
  OptionalModel,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest } from "rxjs";
import { ElementaFrame, ElementaStage } from "../../../../_interfaces/_.js";
import { IdentifiableModel } from "../../../_shared/identifiable.js";
import {
  RenderableContentModel,
  createRenderableContentModel,
} from "./renderable_content/_content.js";
import { RenderingContextModel } from "./rendering_context.js";

export class ElementaFrameModel
  extends IdentifiableModel<ElementaFrameData>
  implements ElementaFrame
{
  readonly stage: ElementaStage;
  readonly context: RenderingContextModel;

  private _state: RecordState<
    Omit<ElementaFrameData, "id" | "renderingContext" | "content">
  >;
  private _content: OptionalModel<RenderableContentModel>;

  get content(): RenderableContentModel | undefined {
    return this._content.state.value;
  }
  get content$(): Observable<RenderableContentModel | undefined> {
    return this._content.state.value$;
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

  get data(): ElementaFrameData {
    return {
      ...super._data,
      ...this._state.record,
      context: this.context.data,
      content: this._content.data,
    };
  }

  get data$(): Observable<ElementaFrameData> {
    return combineLatestMerged([
      super._data$,
      this._state.record$,
      combineLatest({
        context: this.context.data$,
        content: this._content.data$,
      }),
    ]);
  }

  constructor({
    init,
    stage,
  }: {
    init: ElementaFrameData;
    stage: ElementaStage;
  }) {
    const { id, context, content, ...stateData } = init;
    super({ id, key: keyManager.next("elementa-frame") });

    this.stage = stage;

    this.context = new RenderingContextModel({
      init: context ?? {},
    });

    this._content = new OptionalModel({
      init: content,
      create: (data) =>
        createRenderableContentModel({
          init: data,
          project: this.stage.project,
        }),
    });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
      this.context.dispose();
      this.content?.dispose();
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

  restore(data: ElementaFrameData) {
    const { id, context, content, ...stateData } = data;
    super.restore({ id });

    this._state.setRecord(stateData);
    this._content.restore(content);
    this.context.restore(context ?? {});
  }
}
