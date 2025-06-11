import {
  CornerData,
  CornerName,
  ElementaPreviewData,
} from "@elllphnt/elementa-base";
import { ElementaPreview, RenderingEnvironment } from "@elllphnt/elementa-core";
import {
  Model,
  OptionalModel,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map } from "rxjs";
import {
  StatefulRenderableContent,
  StatefulcreateRenderableContent,
} from "./renderable_content/_content.js";
import { StatefulRenderingContext } from "./rendering_context.js";

export class StatefulElementaPreview
  extends Model<ElementaPreviewData>
  implements ElementaPreview
{
  readonly environment: RenderingEnvironment;
  readonly context: StatefulRenderingContext;

  private _state: RecordState<Omit<ElementaPreviewData, "context" | "content">>;
  private _content: OptionalModel<StatefulRenderableContent>;

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
      combineLatest({
        context: this.context.data$,
        content: this._content.data$,
      }),
    ]);
  }

  constructor({
    init,
    environment,
  }: {
    init: ElementaPreviewData;
    environment: RenderingEnvironment;
  }) {
    const { context, content, ...stateData } = init;
    super({ key: keyManager.next("elementa-preview") });

    this.environment = environment;

    this.context = new StatefulRenderingContext({
      init: context ?? {
        __crdtAtomic: ["styleModifiers[*]"],
      },
    });

    this._content = new OptionalModel({
      init: content,
      create: (data) =>
        StatefulcreateRenderableContent({ init: data, environment }),
    });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
      this.context.dispose();
    });
  }

  restore(data: ElementaPreviewData) {
    const { context, content, ...stateData } = data;

    this._state.setRecord(stateData);
    this.context.restore(
      context ?? {
        __crdtAtomic: ["styleModifiers[*]"],
      }
    );
    this._content.restore(content);
  }
}
