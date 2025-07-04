import type {
  CornerData,
  CornerName,
  ElementaPreviewData,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model, OptionalModel } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import type { ElementaEnvironment } from "./environment.js";
import type { RenderableContent } from "./renderable_content/_content.js";
import { createRenderableContent } from "./renderable_content/_content.js";
import { RenderingContext } from "./rendering_context.js";

export class ElementaPreview extends Model<
  RecordState<Omit<ElementaPreviewData, "context" | "content">>
> {
  readonly environment: ElementaEnvironment;
  readonly context: RenderingContext;

  private _content: OptionalModel<RecordState<any>, RenderableContent>;

  get content() {
    return this._content.model;
  }

  get content$() {
    return this._content.model$;
  }

  get corners(): CornerData<number> | undefined {
    return this.state.entry("corners");
  }

  get corners$(): Observable<CornerData<number> | undefined> {
    return this.state.entry$("corners");
  }

  corner(name: CornerName): number | undefined {
    switch (name) {
      case "top-left":
        return this.corners?.topLeft;
      case "top-right":
        return this.corners?.topRight;
      case "bottom-left":
        return this.corners?.bottomLeft;
      case "bottom-right":
        return this.corners?.bottomRight;
      default:
        return undefined;
    }
  }

  corner$(name: CornerName): Observable<number | undefined> {
    return this.state.entry$("corners").pipe(
      map((corners) => {
        switch (name) {
          case "top-left":
            return corners?.topLeft;
          case "top-right":
            return corners?.topRight;
          case "bottom-left":
            return corners?.bottomLeft;
          case "bottom-right":
            return corners?.bottomRight;
          default:
            return undefined;
        }
      })
    );
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<ElementaPreviewData>;
    environment: ElementaEnvironment;
  }) {
    super({ state });

    this.environment = environment;

    // TODO: Initialize context with backend-agnostic state
    // For now, create a context with empty state - this needs proper initialization
    this.context = new RenderingContext({
      state: state.getRecordState("context"),
    });

    this._content = new OptionalModel<RecordState<any>, RenderableContent>({
      state: state.getOptionalRecordState("content"),
      create: (state) =>
        createRenderableContent({
          state,
          environment,
        }),
    });

    this.addLifecycle(this._content);
    this.addLifecycle(this.context);
  }
}
