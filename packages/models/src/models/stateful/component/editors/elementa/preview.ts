import {
  CornerData,
  CornerName,
  ElementaPreviewData,
} from "@elllphnt/elementa-base";
import {
  Model,
  OptionalModel,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { Project } from "../../../../../infrastructure/_.js";
import { ElementaPreview } from "../../../../_interfaces/_.js";
import {
  RenderableContentModel,
  createRenderableContentModel,
} from "./renderable_content/_content.js";
import { RenderingContextModel } from "./rendering_context.js";

export class ElementaPreviewModel
  extends Model<ElementaPreviewData>
  implements ElementaPreview
{
  readonly project: Project;
  readonly context: RenderingContextModel;

  private _state: RecordState<Omit<ElementaPreviewData, "context" | "content">>;
  private _content: OptionalModel<RenderableContentModel>;

  get content() {
    return this._content.state.value;
  }
  get content$() {
    return this._content.state.value$;
  }

  get corners(): CornerData<number> | undefined {
    return this._state.entry("corners");
  }

  get corners$(): Observable<CornerData<number> | undefined> {
    return this._state.entry$("corners");
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
    return this._state.entry$("corners").pipe(
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

  get data(): ElementaPreviewData {
    return {
      ...this._state.record,
      context: this.context.data,
      content: this._content.data,
    };
  }

  get data$(): Observable<ElementaPreviewData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        context: this.context.data$,
        content: this._content.data$,
      }),
    ]);
  }

  constructor({
    init,
    project,
  }: {
    init: ElementaPreviewData;
    project: Project;
  }) {
    super();

    this.project = project;
    this.context = new RenderingContextModel({
      init: init.context ?? {},
    });
    this._content = new OptionalModel({
      init: init.content,
      create: (data) => createRenderableContentModel({ init: data, project }),
    });

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
      this.context.dispose();
    });
  }

  restore(data: ElementaPreviewData) {
    this._state.setRecord(data);
    this.context.restore(data.context ?? {});
    this._content.restore(data.content);
  }
}
