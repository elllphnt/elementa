import type { CornerData, ElementaFrameData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { OptionalModel } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import type { Project } from "~/project/project.js";
import { Identifiable } from "../identifiable.js";
import type { RenderableContent } from "./renderable_content/_content.js";
import { createRenderableContent } from "./renderable_content/_content.js";
import { RenderingContext } from "./rendering_context.js";
import type { ElementaStage } from "./stage.js";

export class ElementaFrame extends Identifiable<
  Omit<ElementaFrameData, "context" | "content">
> {
  readonly stage: ElementaStage;
  readonly context: RenderingContext;

  private _content: OptionalModel<RecordState<any>, RenderableContent>;

  get content(): RenderableContent | undefined {
    return this._content.model;
  }

  get content$(): Observable<RenderableContent | undefined> {
    return this._content.model$;
  }

  get name(): string | undefined {
    return this.state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get x(): number | undefined {
    return this.state.entry("x");
  }

  get x$(): Observable<number | undefined> {
    return this.state.entry$("x");
  }

  get y(): number | undefined {
    return this.state.entry("y");
  }

  get y$(): Observable<number | undefined> {
    return this.state.entry$("y");
  }

  get height(): number | undefined {
    return this.state.entry("height");
  }

  get height$(): Observable<number | undefined> {
    return this.state.entry$("height");
  }

  get width(): number | undefined {
    return this.state.entry("width");
  }

  get width$(): Observable<number | undefined> {
    return this.state.entry$("width");
  }

  get corners(): CornerData<number> | undefined {
    return this.state.entry("corners");
  }

  get corners$(): Observable<CornerData<number> | undefined> {
    return this.state.entry$("corners");
  }

  constructor({
    state,
    stage,
    project,
    initialized,
  }: {
    state: RecordState<ElementaFrameData>;
    stage: ElementaStage;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project, initialized });

    this.stage = stage;

    this.context = new RenderingContext({
      state: state.getRecordState("context"),
    });

    this._content = new OptionalModel<RecordState<any>, RenderableContent>({
      state: state.getOptionalRecordState("content"),
      create: (state) =>
        createRenderableContent({
          state,
          environment: this.stage.environment,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
      this.context.dispose();
    });
  }

  setName(name: string | undefined): void {
    this.state.set("name", name);
  }

  setX(x: number | undefined): void {
    if (typeof x === "number") {
      this.state.set("x", Math.round(x));
    } else {
      this.state.set("x", x);
    }
  }

  setY(y: number | undefined): void {
    if (typeof y === "number") {
      this.state.set("y", Math.round(y));
    } else {
      this.state.set("y", y);
    }
  }

  setHeight(height: number | undefined): void {
    if (typeof height === "number") {
      this.state.set("height", Math.max(0, Math.round(height)));
    } else {
      this.state.set("height", height);
    }
  }

  setWidth(width: number | undefined): void {
    if (typeof width === "number") {
      this.state.set("width", Math.max(0, Math.round(width)));
    } else {
      this.state.set("width", width);
    }
  }

  setCorners(corners: CornerData<number> | undefined): void {
    this.state.set("corners", corners);
  }
}
