import { RouterRenderableContentData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import { ElementaEnvironment } from "../environment.js";
import { BaseRenderableContent } from "./_base.js";

export class RouterRenderableContent extends BaseRenderableContent<RouterRenderableContentData> {
  get routerUrl(): string | undefined {
    return this.state.entry("routerUrl");
  }

  get routerUrl$(): Observable<string | undefined> {
    return this.state.entry$("routerUrl");
  }

  // get router(): FileModelAdaptor<"router"> | undefined {
  //   const absoluteUrl = this.routerUrl
  //     ? this.environment.project.absoluteFileUrl(this.routerUrl)
  //     : undefined;
  //   return absoluteUrl
  //     ? this.environment.project.infrastructure.router(absoluteUrl)
  //     : undefined;
  // }

  // get router$(): Observable<FileModelAdaptor<"router"> | undefined> {
  //   return this.routerUrl$.pipe(
  //     map((url) =>
  //       url
  //         ? this.environment.project.infrastructure.router(
  //             this.environment.project.absoluteFileUrl(url)
  //           )
  //         : undefined
  //     )
  //   );
  // }

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
  router: FileModelAdaptor<"router", File> | undefined;
  router$: Observable<FileModelAdaptor<"router", File> | undefined>;
}
