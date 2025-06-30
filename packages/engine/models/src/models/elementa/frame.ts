import { CornerData, ElementaFrameData } from "@elllphnt/elementa-base";
import { OptionalModel, RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Identifiable } from "../identifiable.js";
import {
  RenderableContent,
  createRenderableContent,
} from "./renderable_content/_content.js";
import { RenderingContext } from "./rendering_context.js";
import { ElementaStage } from "./stage.js";

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
  }: {
    state: RecordState<Omit<ElementaFrameData, "context" | "content">>;
    stage: ElementaStage;
    project: Project;
  }) {
    super({ state, project });

    this.stage = stage;

    // TODO: Initialize context with backend-agnostic state
    // For now, create a context with empty state - this needs proper initialization
    this.context = new RenderingContext({
      state: state as any, // TODO: Fix proper context state initialization
    });

    this._content = new OptionalModel<RecordState<any>, RenderableContent>({
      state: state as any, // TODO: Fix proper state typing for optional content
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
    this.state.set("x", x);
  }

  setY(y: number | undefined): void {
    this.state.set("y", y);
  }

  setHeight(height: number | undefined): void {
    this.state.set("height", height);
  }

  setWidth(width: number | undefined): void {
    this.state.set("width", width);
  }

  setCorners(corners: CornerData<number> | undefined): void {
    this.state.set("corners", corners);
  }
}
