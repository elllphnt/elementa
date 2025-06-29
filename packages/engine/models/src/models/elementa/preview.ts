import {
  CornerData,
  CornerName,
  ElementaPreviewData,
} from "@elllphnt/elementa-base";
import { Model, OptionalModel, RecordState } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { ElementaEnvironment } from "./environment.js";
import {
  RenderableContent,
  createRenderableContent,
} from "./renderable_content/_content.js";
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
    state: RecordState<Omit<ElementaPreviewData, "context" | "content">>;
    environment: ElementaEnvironment;
  }) {
    super({ state });

    this.environment = environment;

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
          environment,
        }),
    });

    this.addDisposer(() => {
      this._content.dispose();
      this.context.dispose();
    });
  }
}
