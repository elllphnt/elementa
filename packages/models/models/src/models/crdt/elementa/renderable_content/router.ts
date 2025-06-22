import { RouterRenderableContentData } from "@elllphnt/elementa-base";
import {
  ElementaEnvironment,
  FileModelAdaptor,
  RouterRenderableContent,
} from "@elllphnt/elementa-core";
import { CrdtRecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseRenderableContent } from "./_base.js";

export class CrdtRouterRenderableContent
  extends CrdtBaseRenderableContent<"router">
  implements RouterRenderableContent
{
  private _state: CrdtRecordState<Omit<RouterRenderableContentData, "type">>;

  get routerUrl(): string | undefined {
    return this._state.entry("routerUrl");
  }

  get routerUrl$(): Observable<string | undefined> {
    return this._state.entry$("routerUrl");
  }

  get router(): FileModelAdaptor<"router"> | undefined {
    const absoluteUrl = this.routerUrl
      ? this.environment.project.absoluteFileUrl(this.routerUrl)
      : undefined;
    return absoluteUrl
      ? this.environment.project.infrastructure.router(absoluteUrl)
      : undefined;
  }

  get router$(): Observable<FileModelAdaptor<"router"> | undefined> {
    return this.routerUrl$.pipe(
      map((url) =>
        url
          ? this.environment.project.infrastructure.router(
              this.environment.project.absoluteFileUrl(url)
            )
          : undefined
      )
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
    super({
      crdt,
      type: "router",
      environment,
      initialized,
    });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtRouterRenderableContent({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
