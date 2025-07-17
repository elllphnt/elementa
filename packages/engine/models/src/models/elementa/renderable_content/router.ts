import type {
  ImportReference,
  RouterRenderableContentData,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import  {map } from "rxjs";
import type { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import type { ElementaEnvironment } from "../environment.js";
import { BaseRenderableContent } from "./_base.js";

export class RouterRenderableContent extends BaseRenderableContent<RouterRenderableContentData> {
  get routerRef(): ImportReference | undefined {
    return this.state.entry("routerRef");
  }

  get routerRef$(): Observable<ImportReference | undefined> {
    return this.state.entry$("routerRef");
  }

  get router(): FileModelAdaptor<"router"> | undefined {
    let resolvedUrl = this.routerRef?.__import.module;
    if (resolvedUrl === "host") {
      resolvedUrl = this.environment.hostUrl;
    }
    return resolvedUrl
      ? this.environment.project.infrastructure.router(
          this.environment.project.absoluteFileUrl(resolvedUrl)
        )
      : undefined;
  }

  get router$(): Observable<FileModelAdaptor<"router"> | undefined> {
    return this.routerRef$.pipe(
      map((url) => {
        let resolvedUrl = url?.__import.module;
        if (resolvedUrl === "host") {
          resolvedUrl = this.environment.hostUrl;
        }
        return resolvedUrl
          ? this.environment.project.infrastructure.router(
              this.environment.project.absoluteFileUrl(resolvedUrl)
            )
          : undefined;
      })
    );
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<RouterRenderableContentData>;
    environment: ElementaEnvironment;
  }) {
    super({
      state,
      type: "router",
      environment,
    });
  }
}
