import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import {
  CornerData,
  CornerName,
  ElementaPreviewData,
} from "@elllphnt/elementa-base";
import { ElementaEnvironment, ElementaPreview } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  OptionalCrdtModel,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import * as y from "yjs";
import {
  CrdtRenderableContent,
  CrdtcreateRenderableContent,
} from "./renderable_content/_content.js";
import { CrdtRenderingContext } from "./rendering_context.js";

export class CrdtElementaPreview
  extends CrdtModel<y.Map<any>>
  implements ElementaPreview
{
  readonly environment: ElementaEnvironment;
  readonly context: CrdtRenderingContext;

  private _state: CrdtRecordState<
    Omit<ElementaPreviewData, "context" | "content">
  >;
  private _content: OptionalCrdtModel<CrdtRenderableContent>;

  get content() {
    return this._content.model;
  }

  get content$() {
    return this._content.model$;
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

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementaEnvironment;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("elementa-preview"), crdt });

    this.environment = environment;

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
          environment,
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

  protected factory(crdt: y.Map<any>): this {
    return new CrdtElementaPreview({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
