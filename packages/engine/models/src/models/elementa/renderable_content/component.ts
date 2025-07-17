import type { ComponentRenderableContentData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import type { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import type { ElementaEnvironment } from "../environment.js";
import { BaseRenderableContent } from "./_base.js";

export class ComponentRenderableContent extends BaseRenderableContent<ComponentRenderableContentData> {
  get componentRef() {
    return this.state.entry("componentRef");
  }

  get componentRef$() {
    return this.state.entry$("componentRef");
  }

  get component(): FileModelAdaptor<"component"> | undefined {
    let resolvedUrl = this.componentRef?.__import.module;
    if (resolvedUrl === "host") {
      resolvedUrl = this.environment.hostUrl;
    }
    return resolvedUrl
      ? this.environment.project.infrastructure.component(
          this.environment.project.absoluteFileUrl(resolvedUrl)
        )
      : undefined;
  }

  get component$(): Observable<FileModelAdaptor<"component"> | undefined> {
    return this.componentRef$.pipe(
      map((url) => {
        let resolvedUrl = url?.__import.module;
        if (resolvedUrl === "host") {
          resolvedUrl = this.environment.hostUrl;
        }
        return resolvedUrl
          ? this.environment.project.infrastructure.component(
              this.environment.project.absoluteFileUrl(resolvedUrl)
            )
          : undefined;
      })
    );
  }

  get props(): Record<string, any> | undefined {
    return this.state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this.state.entry$("props");
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<ComponentRenderableContentData>;
    environment: ElementaEnvironment;
  }) {
    super({
      state,
      type: "component",
      environment,
    });
  }
}
